"""Bloque 2 Tests: BR-20 3-way Sync Conflict/Deleted-on-Disk, BR-04 published_version, Agent-Chat Telemetry, Key last_used_at, Comment author_id & Alembic."""

from __future__ import annotations

from pathlib import Path
import pytest
from httpx import ASGITransport, AsyncClient

from application.projects.commands.SyncFilesystemDocs import SyncFilesystemDocsCommand
from domain.documents import EditorialStatus
from infrastructure.di import get_container
from main import app


@pytest.mark.asyncio
async def test_br20_three_way_sync_conflict_deleted_on_disk_and_resolution(tmp_path: Path) -> None:
    c = get_container()
    await c.initialize_runtime()

    proj_dir = tmp_path / "sync_conflict_proj"
    proj_dir.mkdir(parents=True, exist_ok=True)
    md_file = proj_dir / "arch.md"
    md_file.write_text("# Arquitectura v1\nContenido inicial sincronizado.", encoding="utf-8")

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1) Create project pointing to tmp_path & run initial sync
        p_resp = await client.post(
            "/api/v1/projects",
            json={"name": "Sync Conflict Proj", "slug": "sync-proj", "path": str(proj_dir)},
        )
        assert p_resp.status_code == 201

        s1 = await c.mediator.execute_or_raise(SyncFilesystemDocsCommand(project_slug="sync-proj"))
        assert s1.added_count == 1 and s1.conflicted_count == 0

        doc = await c.doc_repo.get_by_path("arch.md", project_slug="sync-proj")
        assert doc is not None
        assert doc.sync_status == "synced"
        assert doc.last_synced_hash == doc.content_hash

        # 2) Diverge BOTH DB (without touching disk) and Disk independently -> BR-20 MUST detect 'in_conflict' without overwriting!
        ed = doc.apply_edit(title="Arquitectura UI", content_markdown="# Arquitectura UI\nCambio hecho en la UI.", change_summary="UI edit")
        assert not ed.is_error
        await c.doc_repo.save(doc, ed.value, write_to_disk=False)  # type: ignore[call-arg]
        md_file.write_text("# Arquitectura Disco\nCambio hecho en Git/Disco.", encoding="utf-8")

        s2 = await c.mediator.execute_or_raise(SyncFilesystemDocsCommand(project_slug="sync-proj"))
        assert s2.conflicted_count == 1
        assert "arch.md" in s2.conflicted_paths

        doc_conf = await c.doc_repo.get_by_path("arch.md", project_slug="sync-proj")
        assert doc_conf is not None
        assert doc_conf.sync_status == "in_conflict"
        # DB content was NOT silently overwritten!
        assert "Cambio hecho en la UI." in doc_conf.content_markdown

        # 3) Resolve explicitly by keeping DB and writing back to disk
        res_keep = await client.post(
            "/api/v1/documents/sync-resolve",
            json={"path": "arch.md", "project_slug": "sync-proj", "strategy": "keep_db_and_write_disk"},
        )
        assert res_keep.status_code == 200
        assert res_keep.json()["sync_status"] == "synced"
        assert "Cambio hecho en la UI." in md_file.read_text(encoding="utf-8")

        # 4) Delete file on disk -> sync MUST mark 'deleted_on_disk' without destroying DB history
        md_file.unlink()
        s3 = await c.mediator.execute_or_raise(SyncFilesystemDocsCommand(project_slug="sync-proj"))
        assert s3.archived_count == 1
        assert "arch.md" in s3.deleted_on_disk_paths
        doc_del = await c.doc_repo.get_by_path("arch.md", project_slug="sync-proj")
        assert doc_del is not None and doc_del.sync_status == "deleted_on_disk"


@pytest.mark.asyncio
async def test_br04_draft_revision_preserves_published_version_pointer() -> None:
    c = get_container()
    await c.initialize_runtime()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        c_res = await client.post(
            "/api/v1/documents",
            json={
                "project_slug": "default",
                "path": "guides/live_doc_v1.md",
                "title": "Guia en Produccion",
                "module_name": "general",
                "content_markdown": "# Produccion v1\nVersion aprobada visible para clientes.",
                "status": "published",
            },
        )
        assert c_res.status_code == 201

        det1 = await client.get("/api/v1/documents/detail?path=guides/live_doc_v1.md&project=default")
        assert det1.status_code == 200
        assert det1.json()["current_version"] == 1
        assert det1.json()["published_version"] == 1

        # Create a draft revision -> current_version becomes 2 (status=draft), published_version stays 1!
        dr = await client.post(
            "/api/v1/documents/draft-revision",
            json={
                "project_slug": "default",
                "path": "guides/live_doc_v1.md",
                "title": "Guia en Produccion (Borrador v2)",
                "content_markdown": "# Borrador v2\nCambios aun en revision interna.",
            },
        )
        assert dr.status_code == 200
        dr_data = dr.json()
        assert dr_data["status"] == EditorialStatus.DRAFT.value
        assert dr_data["current_version"] == 2
        assert dr_data["published_version"] == 1


@pytest.mark.asyncio
async def test_agent_chat_telemetry_api_key_last_used_and_comment_ownership() -> None:
    c = get_container()
    await c.initialize_runtime()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1) Create API key -> initially last_used_at is None, after using it last_used_at is populated!
        k_res = await client.post(
            "/api/v1/auth/api-keys",
            json={"name": "Telemetry Check Key", "role_scope": "Admin", "allowed_projects": ["default"]},
        )
        assert k_res.status_code == 201
        raw_key = k_res.json()["api_key"]
        key_id = k_res.json()["key_id"]

        # Use the key on /api/v1/auth/me
        me = await client.get("/api/v1/auth/me", headers={"X-API-Key": raw_key})
        assert me.status_code == 200

        keys_list = await client.get("/api/v1/auth/api-keys?page=1&page_size=50")
        assert keys_list.status_code == 200
        found = next(k for k in keys_list.json()["items"] if k["key_id"] == key_id)
        assert found["last_used_at"] is not None

        # 2) Agent chat persists session linked to agent_id/agent_version + telemetry on chat_messages
        ag_res = await client.post(
            "/api/v1/projects/default/agents",
            json={
                "name": "Telemetry Agent",
                "slug": "telemetry-ag",
                "llm_provider": "extractive_fallback",
                "llm_model": "extractive-v2",
                "min_grounding_score": 0.01,
            },
        )
        assert ag_res.status_code == 201
        chat_res = await client.post(
            "/api/v1/projects/default/agents/telemetry-ag/chat",
            json={"question": "Produccion version aprobada"},
        )
        assert chat_res.status_code == 200
        ch_data = chat_res.json()
        assert ch_data["session_id"] is not None
        assert ch_data["agent_version"] == 1
        assert ch_data["tokens_used"] >= 1

        hist = await client.get(f"/api/v1/rag/sessions/{ch_data['session_id']}?project=default")
        assert hist.status_code == 200
        msgs = hist.json()["messages"]
        assert len(msgs) == 2
        asst = msgs[1]
        assert asst["role"] == "assistant"
        assert asst["model_name"] != ""
        assert asst["tokens_used"] >= 1
        assert len(asst["retrieved_chunk_ids"]) >= 1

        # 3) Comment stores author_id and restricts delete to author or Admin
        c_post = await client.post(
            "/api/v1/collaboration/threads",
            json={
                "doc_path": "guides/live_doc_v1.md",
                "project_slug": "default",
                "content": "Comentario auditado con author_id.",
            },
        )
        assert c_post.status_code == 201
        comment_id = c_post.json()["last_comment_id"]
        assert c_post.json()["author_id"] == "local-admin"

        # Non-author Consumer key CANNOT delete local-admin's comment -> 403
        cons_k = await client.post(
            "/api/v1/auth/api-keys",
            json={"name": "Other User Key", "role_scope": "Consumer", "allowed_projects": ["default"]},
        )
        del_denied = await client.delete(
            f"/api/v1/collaboration/comments/{comment_id}",
            headers={"X-API-Key": cons_k.json()["api_key"]},
        )
        assert del_denied.status_code == 403
        assert del_denied.json()["code"] == "comment_delete_forbidden"

        # Original author / Admin CAN delete it
        del_ok = await client.delete(f"/api/v1/collaboration/comments/{comment_id}")
        assert del_ok.status_code == 200 and del_ok.json()["deleted"] is True

        # 4) Project activation endpoint works & Alembic files exist
        act = await client.post("/api/v1/projects/default/activate")
        assert act.status_code == 200 and act.json()["active_project"] == "default"
        assert Path("alembic.ini").exists()
        assert Path("migrations/env.py").exists()
        assert Path("migrations/versions/20261128_0001_bloque2_schema.py").exists()

        await client.delete("/api/v1/projects/default/agents/telemetry-ag")
