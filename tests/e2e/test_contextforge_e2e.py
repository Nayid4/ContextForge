"""End-to-End Tests for ContextForge REST APIs and Screaming Frontend Web Routes."""

import pytest
from httpx import ASGITransport, AsyncClient
from main import app


@pytest.mark.asyncio
async def test_contextforge_web_views() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Root redirects to /docs/browser
        root_res = await client.get("/")
        assert root_res.status_code == 302
        assert "/docs/browser" in root_res.headers["location"]

        # 2. Docs Browser view
        browser_res = await client.get("/docs/browser")
        assert browser_res.status_code == 200
        assert "text/html" in browser_res.headers["content-type"]
        assert "ContextForge" in browser_res.text
        assert "Docs-as-Code" in browser_res.text
        assert "billing" in browser_res.text

        # 3. New Document Editor view
        new_doc_res = await client.get("/docs/new")
        assert new_doc_res.status_code == 200
        assert "Editor Docs-as-Code" in new_doc_res.text

        # 4. HTMX Preview endpoint
        preview_res = await client.post(
            "/docs/preview-htmx",
            data={"content_markdown": "# Título de Prueba HTMX\n\nTexto descriptivo."},
        )
        assert preview_res.status_code == 200
        assert "<h1>Título de Prueba HTMX</h1>" in preview_res.text

        # 5. View existing document detail
        doc_view_res = await client.get("/docs/view/modules/billing/retry_policy.md")
        assert doc_view_res.status_code == 200
        assert "Reintentos" in doc_view_res.text
        assert "retry_policy.md" in doc_view_res.text

        # 6. Add comment to document
        comment_res = await client.post(
            "/docs/view/modules/billing/retry_policy.md/comments",
            data={
                "user_name": "QA Lead",
                "content": "Verificación de regla aprobada.",
            },
            follow_redirects=True,
        )
        assert comment_res.status_code == 200
        assert "QA Lead" in comment_res.text
        assert "Verificación de regla aprobada." in comment_res.text

        # 7. HTMX Reindex endpoint
        reindex_res = await client.post("/docs/reindex")
        assert reindex_res.status_code == 200
        assert "chunks indexados" in reindex_res.text

        # 8. RAG Chat view
        chat_res = await client.get("/chat")
        assert chat_res.status_code == 200
        assert "Chat RAG Soberano" in chat_res.text

        # 9. Context Bundler view
        bundler_res = await client.get("/bundles")
        assert bundler_res.status_code == 200
        assert "Context Bundler" in bundler_res.text

        # 10. Compile Context Bundle via Form
        compile_res = await client.post(
            "/bundles/compile",
            data={
                "modules": ["billing", "architecture"],
                "max_tokens": 12000,
                "include_toc": "true",
                "include_guidelines": "true",
            },
        )
        assert compile_res.status_code == 200
        assert "Bundle generado exitosamente" in compile_res.text

        # 11. Settings view (Ollama models detection)
        settings_res = await client.get("/settings")
        assert settings_res.status_code == 200
        assert "Configuración del Motor RAG" in settings_res.text
        assert "Modelos LLM Instalados en Local" in settings_res.text

        # 12. Save Settings via Form
        update_settings_res = await client.post(
            "/settings",
            data={
                "active_llm_model": "llama3.1:8b",
                "ollama_url": "http://localhost:11434",
                "docs_path": "./docs",
                "embedding_model": "nomic-embed-text",
                "temperature": 0.15,
            },
        )
        assert update_settings_res.status_code == 200
        assert "Configuración guardada exitosamente" in update_settings_res.text


        # 13. Refresh Models HTMX
        refresh_res = await client.post("/settings/refresh-models")
        assert refresh_res.status_code == 200
        assert "sincronizada en tiempo real" in refresh_res.text

        # 14. Create Doc via Web Form
        new_doc_submit = await client.post(
            "/docs/new",
            data={
                "title": "Documento Creado Web",
                "module": "testing",
                "filename": "web_test.md",
                "author": "Web Tester",
                "tags": "test, e2e",
                "content_markdown": "# Contenido Web\n\nPrueba de creación.",
            },
        )
        assert new_doc_submit.status_code == 302
        assert "/docs/view/modules/testing/web_test.md" in new_doc_submit.headers["location"]

        # 15. Stream Chat SSE
        chat_stream = await client.get("/chat/stream?q=reintentos")
        assert chat_stream.status_code == 200
        assert "text/event-stream" in chat_stream.headers["content-type"]


@pytest.mark.asyncio
async def test_contextforge_rest_api_v1() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Settings API
        set_res = await client.get("/api/v1/settings")
        assert set_res.status_code == 200
        data = set_res.json()
        assert "active_llm_model" in data
        assert data["ollama_url"] == "http://localhost:11434"

        # Update Settings API
        up_res = await client.post(
            "/api/v1/settings",
            json={
                "active_llm_model": "llama3.1:8b",
                "ollama_url": "http://localhost:11434",
                "docs_path": "./docs",
                "embedding_model": "nomic-embed-text",
                "temperature": 0.2,
            },
        )
        assert up_res.status_code == 200
        assert up_res.json()["active_llm_model"] == "llama3.1:8b"

        # List Ollama Models API
        ollama_res = await client.get("/api/v1/settings/ollama-models")
        assert ollama_res.status_code == 200
        models_data = ollama_res.json()
        assert "models" in models_data

        # 2. Docs API
        docs_res = await client.get("/api/v1/docs-api")
        assert docs_res.status_code == 200
        docs_list = docs_res.json()
        assert len(docs_list) >= 3

        # Create Doc API
        create_doc_res = await client.post(
            "/api/v1/docs-api",
            json={
                "relative_path": "modules/testing/api_doc.md",
                "title": "Doc Creado por API",
                "module": "testing",
                "content_markdown": "# Doc API\n\nPrueba API.",
                "author": "API Tester",
                "tags": ["api", "test"],
            },
        )
        assert create_doc_res.status_code == 201
        assert create_doc_res.json()["title"] == "Doc Creado por API"

        # Get Single Doc API
        first_path = docs_list[0]["path"]
        single_doc_res = await client.get(f"/api/v1/docs-api/{first_path}")
        assert single_doc_res.status_code == 200
        assert "content_markdown" in single_doc_res.json()

        # Ingest API
        ingest_res = await client.post("/api/v1/docs-api/ingest?target_dir=./docs")
        assert ingest_res.status_code == 200
        assert ingest_res.json()["indexed_chunks"] > 0

        # 3. Hybrid Search API
        search_res = await client.get("/api/v1/search/hybrid?q=stripe&top_k=3")
        assert search_res.status_code == 200
        search_results = search_res.json()
        assert len(search_results) > 0
        assert "chunk_id" in search_results[0]
        assert "relevance_score" in search_results[0]

        # 4. RAG Ask and Stream APIs
        ask_res = await client.post(
            "/api/v1/rag/ask",
            json={"query": "política de reintentos", "top_k": 3},
        )
        assert ask_res.status_code == 200
        assert "answer" in ask_res.json()
        assert "citations" in ask_res.json()

        stream_res = await client.get("/api/v1/rag/stream?q=política de reintentos")
        assert stream_res.status_code == 200
        assert "text/event-stream" in stream_res.headers["content-type"]

        # 5. Context Bundles Export API
        export_res = await client.post(
            "/api/v1/bundles/export",
            json={
                "modules": ["billing"],
                "max_tokens": 8000,
                "include_toc": True,
                "include_guidelines": True,
            },
        )
        assert export_res.status_code == 200
        bundle_data = export_res.json()
        assert "id" in bundle_data
        assert bundle_data["token_count"] > 0

        # Download bundle REST
        bundle_id = bundle_data["id"]
        download_res = await client.get(f"/api/v1/bundles/{bundle_id}/download")
        assert download_res.status_code == 200
        assert "text/markdown" in download_res.headers["content-type"]

        # Download bundle Web route
        web_download_res = await client.get(f"/bundles/{bundle_id}/download")
        assert web_download_res.status_code == 200
        assert "text/markdown" in web_download_res.headers["content-type"]
