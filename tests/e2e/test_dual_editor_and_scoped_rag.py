"""End-to-End tests for Dual Editor, Multiformat Attachment Upload/Serving and Scoped RAG."""

from __future__ import annotations

import io
from pathlib import Path
from unittest.mock import AsyncMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from main import app


@pytest.mark.asyncio
async def test_dual_editor_page_render() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # GET /books/editor
        resp = await client.get("/books/editor")
        assert resp.status_code == 200
        assert "Editor Dual" in resp.text
        assert "Markdown Pro" in resp.text
        assert "Constructor de Bloques" in resp.text

        # GET /docs/editor alias
        resp_alias = await client.get("/docs/editor")
        assert resp_alias.status_code == 200


@pytest.mark.asyncio
async def test_attachment_upload_and_serving(tmp_path: Path) -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create a mock file in memory
        fake_content = b"%PDF-1.4 Fake PDF Content for unit test"
        files = {
            "file": ("test_manual.pdf", io.BytesIO(fake_content), "application/pdf"),
        }
        data = {
            "library_id": "test_lib",
            "book_id": "spec_auth",
        }

        # Upload attachment
        resp = await client.post(
            "/api/v1/books/upload-attachment",
            data=data,
            files=files,
        )
        assert resp.status_code == 201
        res_data = resp.json()
        assert res_data["file_name"] == "test_manual.pdf"
        assert "assets/spec_auth/test_manual.pdf" in res_data["file_path"]

        # Serve the asset
        asset_url = f"/api/v1/assets/test_lib/{res_data['file_path']}"
        serve_resp = await client.get(asset_url)
        assert serve_resp.status_code == 200
        assert serve_resp.content == fake_content


@pytest.mark.asyncio
async def test_scoped_chat_endpoint() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        with patch("infrastructure.external.ollama_client.OllamaHttpClient.generate", new_callable=AsyncMock) as mock_gen:
            mock_gen.return_value = "La regla técnica define 3 reintentos para evitar sobrecargas."

            payload = {
                "library_id": "test_lib",
                "book_id": "spec_auth",
                "query": "¿Cuántos reintentos se definen?",
                "raw_markdown": "# Reglas de Reintento\n\nSe definen 3 reintentos.",
            }

            resp = await client.post("/api/v1/chat/scoped", json=payload)
            assert resp.status_code == 200
            data = resp.json()
            assert "3 reintentos" in data["answer"]
            assert len(data["sources"]) >= 1


@pytest.mark.asyncio
async def test_save_book_endpoint() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        save_payload = {
            "title": "Protocolo de Webhooks",
            "module": "api",
            "library_id": "test_lib",
            "tags": ["webhooks", "seguridad"],
            "description": "Especificación de firma de webhooks",
            "raw_markdown": "",
            "blocks": [
                {"type": "heading", "level": 1, "text": "Protocolo de Webhooks"},
                {"type": "paragraph", "text": "Todos los webhooks deben firmarse con HMAC-SHA256."},
                {"type": "code", "language": "python", "code": "def sign_payload(): pass"},
            ],
        }

        resp = await client.post("/api/v1/books/save", json=save_payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "success"
        assert "protocolo-de-webhooks.md" in data["path"]

        # Verify file exists on disk
        saved_file = Path("./docs") / data["path"]
        assert saved_file.exists()
        content = saved_file.read_text(encoding="utf-8")
        assert "HMAC-SHA256" in content
        assert "title: Protocolo de Webhooks" in content


@pytest.mark.asyncio
async def test_parse_markdown_and_compile_blocks_endpoints() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Test parse-markdown
        raw_md = "# Título Principal\n\nTexto explicativo.\n\n```python\nprint(1)\n```\n"
        parse_resp = await client.post("/api/v1/books/parse-markdown", json={"raw_markdown": raw_md})
        assert parse_resp.status_code == 200
        parse_data = parse_resp.json()
        assert len(parse_data["blocks"]) >= 3
        assert parse_data["blocks"][0]["type"] == "heading"

        # Test compile-blocks
        compile_payload = {
            "title": "Documento Compilado",
            "module": "core",
            "library_id": "test_lib",
            "tags": ["test"],
            "description": "Desc",
            "blocks": parse_data["blocks"],
        }
        compile_resp = await client.post("/api/v1/books/compile-blocks", json=compile_payload)
        assert compile_resp.status_code == 200
        compile_data = compile_resp.json()
        assert "# Título Principal" in compile_data["raw_markdown"]
        assert "```python" in compile_data["raw_markdown"]


@pytest.mark.asyncio
async def test_dual_editor_load_existing_document() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Load existing document into dual editor
        resp = await client.get("/books/editor?path=architecture/adrs/001_event_driven_payments.md&project=default")
        assert resp.status_code == 200
        assert "Editar Documento" in resp.text
        assert "ADR 001" in resp.text


@pytest.mark.asyncio
async def test_save_book_in_place_with_doc_path() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # First create a temporary test doc
        initial_payload = {
            "title": "Documento Editable Temporal",
            "module": "general",
            "library_id": "test_lib",
            "tags": ["editable"],
            "raw_markdown": "# Documento Editable Temporal\n\nVersion inicial 1.0\n",
        }
        res_create = await client.post("/api/v1/books/save", json=initial_payload)
        assert res_create.status_code == 200
        created_path = res_create.json()["path"]

        # Now edit it in-place using doc_path
        update_payload = {
            "title": "Documento Editable Temporal Modificado",
            "module": "general",
            "library_id": "test_lib",
            "tags": ["editable", "v2"],
            "doc_path": created_path,
            "raw_markdown": "# Documento Editable Temporal Modificado\n\nVersion actualizada 2.0 con cambios en sitio.\n",
        }
        res_update = await client.post("/api/v1/books/save", json=update_payload)
        assert res_update.status_code == 200
        updated_data = res_update.json()
        assert updated_data["path"] == created_path

        # Verify disk file content updated in-place
        target_file = Path("./docs") / created_path
        assert target_file.exists()
        disk_text = target_file.read_text(encoding="utf-8")
        assert "Version actualizada 2.0 con cambios en sitio." in disk_text


@pytest.mark.asyncio
async def test_document_views_contain_edit_buttons() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Check doc_detail view has edit button
        view_resp = await client.get("/docs/view/architecture/adrs/001_event_driven_payments.md")
        assert view_resp.status_code == 200
        assert "Editar Documento" in view_resp.text
        assert "/books/editor?path=architecture/adrs/001_event_driven_payments.md" in view_resp.text

        # Check docs_browser view has edit link on cards
        browser_resp = await client.get("/docs/browser")
        assert browser_resp.status_code == 200
        assert "Editar" in browser_resp.text
        assert "/books/editor?path=" in browser_resp.text



