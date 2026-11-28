from __future__ import annotations
import re
from fastapi.testclient import TestClient
from main import create_app

EMOJI_RE = re.compile(r"[\U0001F300-\U0001FAFF]")


def test_full_ers_v2_end_to_end_flows() -> None:
    app = create_app()
    with TestClient(app) as client:
        # 1. Health & All Screaming Web SPA Routes (0 Emojis)
        assert client.get("/health/ready").status_code == 200
        for route in ("/", "/docs/browser", "/books/editor", "/chat", "/asistente-ia", "/bundles", "/projects", "/settings", "/docs/integration-guide"):
            r_web = client.get(route)
            assert r_web.status_code == 200
            assert not EMOJI_RE.search(r_web.text)

        # 2. Seeded JWT Login & API Key Issuance (RF-CFG-003, RNF-01, RNF-02)
        login = client.post("/api/v1/auth/login", json={"email": "admin@contextforge.local", "password": "Admin123!"})
        assert login.status_code == 200
        admin_token = login.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        key_resp = client.post(
            "/api/v1/auth/api-keys",
            headers=admin_headers,
            json={"name": "IDE Agent Key", "role_scope": "AgentClient", "allowed_projects": ["default"]},
        )
        assert key_resp.status_code == 201
        agent_api_key = key_resp.json()["api_key"]

        # AgentClient forbidden from deleting documents or accessing unauthorized project (RBAC!)
        forbid_del = client.delete("/api/v1/documents?path=arch_retries.md&project=default", headers={"X-API-Key": agent_api_key})
        assert forbid_del.status_code == 403
        assert forbid_del.headers["content-type"].startswith("application/problem+json")

        # 3. Editorial Gate BR-04: Create DRAFT -> invisible in RAG -> PUBLISH -> visible in RAG & MCP!
        c_draft = client.post(
            "/api/v1/documents",
            headers=admin_headers,
            json={
                "path": "sec/zero_trust.md",
                "title": "Arquitectura Zero Trust",
                "content_markdown": "# Zero Trust\nCódigo secreto de verificación: ZT_ALPHA_999.",
                "module_name": "security",
                "project_slug": "default",
                "status": "draft",
            },
        )
        assert c_draft.status_code == 201

        s_before = client.get("/api/v1/rag/search?q=ZT_ALPHA_999&project=default", headers={"X-API-Key": agent_api_key})
        assert s_before.status_code == 200 and s_before.json()["count"] == 0

        pub = client.patch(
            "/api/v1/documents/state",
            headers=admin_headers,
            json={"path": "sec/zero_trust.md", "target_status": "published", "project_slug": "default"},
        )
        assert pub.status_code == 200 and pub.json()["status"] == "published"

        s_after = client.get("/api/v1/rag/search?q=ZT_ALPHA_999&project=default", headers={"X-API-Key": agent_api_key})
        assert s_after.status_code == 200 and s_after.json()["count"] >= 1

        # 4. Optimistic Concurrency ETag 409 Conflict (BR-11) + Diff & Rollback (RF-DOC-004)
        conflict = client.put(
            "/api/v1/documents",
            headers={**admin_headers, "If-Match": 'W/"v1-stale"'},
            json={
                "path": "sec/zero_trust.md",
                "title": "Arquitectura Zero Trust",
                "content_markdown": "# Zero Trust\nIntento obsoleto.",
                "project_slug": "default",
            },
        )
        assert conflict.status_code == 409

        upd_ok = client.put(
            "/api/v1/documents",
            headers=admin_headers,
            json={
                "path": "sec/zero_trust.md",
                "title": "Arquitectura Zero Trust v3",
                "content_markdown": "# Zero Trust\nVersión actualizada ZT_ALPHA_999.",
                "project_slug": "default",
                "expected_version": 2,
            },
        )
        assert upd_ok.status_code == 200 and upd_ok.json()["version"] == 3

        diff_r = client.get("/api/v1/documents/diff?path=sec/zero_trust.md&from_version=1&to_version=3&project=default", headers=admin_headers)
        assert diff_r.status_code == 200 and diff_r.json()["added_lines"] >= 1

        rb_r = client.post(
            "/api/v1/documents/rollback",
            headers=admin_headers,
            json={"path": "sec/zero_trust.md", "target_version": 1, "reason": "Prueba rollback", "project_slug": "default"},
        )
        assert rb_r.status_code == 200 and rb_r.json()["new_version"] == 4

        # 5. Attachment Policy BR-16 (201 on .txt, 415 on .exe)
        att_ok = client.post(
            "/api/v1/documents/attachments",
            headers=admin_headers,
            data={"book_path": "sec/zero_trust.md", "project_slug": "default"},
            files={"file": ("anexo.txt", b"Contenido tecnico adjunto", "text/plain")},
        )
        assert att_ok.status_code == 201 and len(att_ok.json()["sha256_checksum"]) == 64

        att_bad = client.post(
            "/api/v1/documents/attachments",
            headers=admin_headers,
            data={"book_path": "sec/zero_trust.md", "project_slug": "default"},
            files={"file": ("virus.exe", b"MZ\x00\x00", "application/octet-stream")},
        )
        assert att_bad.status_code == 415

        # 6. Sovereign Project + RAG SSE Streaming + Citations + Abstention (RF-RAG-003, RF-RAG-004)
        rag_sse = client.post(
            "/api/v1/rag/stream",
            headers=admin_headers,
            json={"question": "ERR_WEBHOOK_504 reintentos backoff", "project_slug": "default"},
        )
        assert rag_sse.status_code == 200
        assert "event: citations" in rag_sse.text and "arch_retries.md" in rag_sse.text and "event: done" in rag_sse.text

        # 7. Context Bundle Compilation + SHA-256 Header (RF-BND-001, RF-BND-002)
        bnd = client.post(
            "/api/v1/bundles/compile",
            headers={"X-API-Key": agent_api_key},
            json={"name": "Agente Pack", "project_slug": "default", "max_tokens": 2000, "export_format": "json"},
        )
        assert bnd.status_code == 201 and "X-Bundle-SHA256" in bnd.headers
        exp = client.get(f"/api/v1/bundles/{bnd.json()['bundle_id']}/export", headers={"X-API-Key": agent_api_key})
        assert exp.status_code == 200 and exp.headers["X-Bundle-SHA256"] == bnd.json()["bundle_hash"]

        # 8. Universal MCP JSON-RPC 2.0 Server (/mcp) + Scope Enforcement (RF-BND-003)
        mcp_call = client.post(
            "/mcp/",
            headers={"X-API-Key": agent_api_key},
            json={
                "jsonrpc": "2.0",
                "id": 7,
                "method": "tools/call",
                "params": {"name": "search_project_context", "arguments": {"query": "ERR_WEBHOOK_504", "project_slug": "default"}},
            },
        )
        assert mcp_call.status_code == 200 and "arch_retries.md" in mcp_call.text

        mcp_denied = client.post(
            "/mcp/",
            headers={"X-API-Key": agent_api_key},
            json={
                "jsonrpc": "2.0",
                "id": 8,
                "method": "tools/call",
                "params": {"name": "list_project_structure", "arguments": {"project_slug": "proyecto-secreto"}},
            },
        )
        assert mcp_denied.status_code == 403

        # 9. WebSockets, Comments, Idempotent Ratings & Immutable Audit Logs (BR-14 -> 405!)
        with client.websocket_connect("/api/v1/ws/collaboration?project=default&user=Ana") as ws:
            presence = ws.receive_json()
            assert presence["event"] == "presence.sync"
            ws.send_json({"action": "ping"})
            assert ws.receive_json()["event"] == "pong"

        r1 = client.post("/api/v1/collaboration/ratings", headers=admin_headers, json={"doc_path": "arch_retries.md", "project_slug": "default", "score": 4})
        r2 = client.post("/api/v1/collaboration/ratings", headers=admin_headers, json={"doc_path": "arch_retries.md", "project_slug": "default", "score": 5})
        assert r1.status_code == 200 and r2.json()["total_ratings"] == 1 and r2.json()["average_score"] == 5.0

        audit_list = client.get("/api/v1/audit-logs", headers=admin_headers)
        assert audit_list.status_code == 200 and audit_list.json()["chain_integrity_valid"] is True
        immut = client.delete("/api/v1/audit-logs/any-id", headers=admin_headers)
        assert immut.status_code == 405
