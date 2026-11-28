"""Phase 2 Security Tests: explicit egress_class, strict HTTPS + CIDR/IPv6/DNS SSRF + no redirects, secret_encrypted webhooks, draft import & embeddings reindex status."""

from __future__ import annotations

import socket
from pathlib import Path
from typing import Any
import pytest
from httpx import ASGITransport, AsyncClient

from domain.rag import ChunkVO, SovereignRoutingPolicy
from domain.users import UserEntity, UserRole
from infrastructure.di import get_container
from infrastructure.integrations.rag.vector_store_adapter import SovereignVectorStoreAdapter
from infrastructure.integrations.webhooks.webhook_dispatcher import WebhookDispatcher
from main import app


def test_webhook_ssrf_strict_https_all_cidr_ranges_ipv4_mapped_and_dns(monkeypatch: pytest.MonkeyPatch) -> None:
    # Plain HTTP is strictly forbidden in Phase 2
    assert WebhookDispatcher.is_valid_url("http://hooks.example.com/cf") is False

    # Missing CIDR ranges explicitly blocked: 0.0.0.0/8, 100.64.0.0/10, fc00::/7, fe80::/10, IPv4-mapped IPv6
    for blocked in (
        "https://0.0.0.0/hook",
        "https://0.1.2.3/hook",
        "https://100.64.0.1/hook",
        "https://100.127.255.254/hook",
        "https://[fc00::1]/hook",
        "https://[fd12:3456::1]/hook",
        "https://[fe80::1]/hook",
        "https://[::ffff:127.0.0.1]/hook",
        "https://[::ffff:10.0.0.5]/hook",
        "https://[::ffff:169.254.169.254]/hook",
        "https://[::ffff:100.64.1.2]/hook",
    ):
        assert WebhookDispatcher.is_valid_url(blocked) is False, f"Expected SSRF block for {blocked}"

    # DNS resolution returning a forbidden private/CGNAT IP must block the hostname!
    def fake_getaddrinfo_private(host: str, port: Any, *args: Any, **kwargs: Any) -> list[Any]:
        return [(socket.AF_INET, socket.SOCK_STREAM, 6, "", ("100.64.0.42", 443))]

    monkeypatch.setattr(socket, "getaddrinfo", fake_getaddrinfo_private)
    assert WebhookDispatcher.is_valid_url("https://rebind-attack.example.com/hook") is False

    # Public IP resolved via DNS is allowed
    def fake_getaddrinfo_public(host: str, port: Any, *args: Any, **kwargs: Any) -> list[Any]:
        return [(socket.AF_INET, socket.SOCK_STREAM, 6, "", ("93.184.216.34", 443))]

    monkeypatch.setattr(socket, "getaddrinfo", fake_getaddrinfo_public)
    assert WebhookDispatcher.is_valid_url("https://hooks.example.com/cf") is True


@pytest.mark.asyncio
async def test_explicit_egress_class_encrypted_webhook_secret_draft_import_and_embeddings_status(tmp_path: Path) -> None:
    c = get_container()
    await c.initialize_runtime()

    # 1) Explicit egress_class persisted & honored
    assert SovereignRoutingPolicy.classify_egress(provider_engine_type="local_cli", provider_name="antigravity_cli") == "cloud"
    assert SovereignRoutingPolicy.classify_egress(provider_engine_type="local_http", base_url="http://127.0.0.1:11434") == "local"
    assert SovereignRoutingPolicy.classify_egress(provider_engine_type="local_http", egress_class="cloud") == "cloud"

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        provs = await client.get("/api/v1/settings/llm-providers")
        assert provs.status_code == 200
        by_id = {p["provider"]: p for p in provs.json()["items"]}
        assert by_id["ollama"]["egress_class"] == "local"
        assert by_id["antigravity_cli"]["egress_class"] == "cloud"
        assert by_id["openai"]["egress_class"] == "cloud"

        # 2) Webhook rejects http:// and encrypts secret at rest into secret_encrypted (never plaintext in DB!)
        http_wh = await client.post(
            "/api/v1/projects/default/webhooks",
            json={"url": "http://hooks.example.com/plain", "events": ["document.published"], "secret": "s3cr3t"},
        )
        assert http_wh.status_code == 422

        https_wh = await client.post(
            "/api/v1/projects/default/webhooks",
            json={"url": "https://hooks.example.com/secure", "events": ["document.published"], "secret": "whsec_top_secret_f2"},
        )
        assert https_wh.status_code == 201
        wh_id = https_wh.json()["webhook_id"]
        stored_hooks = await c.webhook_repo.list_webhooks("default")
        created_wh = next(h for h in stored_hooks if h.webhook_id == wh_id)
        assert created_wh.secret == ""
        assert created_wh.secret_encrypted != "" and "whsec_top_secret_f2" not in created_wh.secret_encrypted
        assert c.vault.decrypt(created_wh.secret_encrypted) == "whsec_top_secret_f2"

        # 3) Export explicitly excludes webhooks & api_keys; Import forces ALL documents to 'draft' and agents to 'private'
        exp = await client.get("/api/v1/projects/default/export")
        assert exp.status_code == 200
        exp_json = exp.json()
        assert "webhooks" not in exp_json and "api_keys" not in exp_json
        assert "webhooks" in exp_json["excluded_sensitive_resources"]

        imp = await client.post(
            "/api/v1/projects/import",
            json={
                "project": {"slug": "f2-draft-import", "name": "Proyecto Import F2"},
                "documents": [
                    {
                        "path": "guides/imported_doc.md",
                        "title": "Doc Importado",
                        "content_markdown": "# Importado\nDebe entrar como borrador.",
                        "status": "published",
                    }
                ],
                "agents": [{"slug": "imp-bot", "name": "Imp Bot", "visibility": "public"}],
                "eval_cases": [],
            },
        )
        assert imp.status_code == 201
        assert imp.json()["documents_status"] == "draft"
        assert imp.json()["agents_visibility"] == "private"
        imported_doc = await c.doc_repo.get_by_path("guides/imported_doc.md", project_slug="f2-draft-import")
        assert imported_doc is not None and imported_doc.status.value == "draft"

        await client.delete(f"/api/v1/projects/default/webhooks/{wh_id}")

        # 4) Embeddings reindex status & Consumer forbidden from triggering reindex
        emb_st = await client.get("/api/v1/settings/embeddings/status")
        assert emb_st.status_code == 200
        assert "needs_reindex" in emb_st.json()

        # Verify VectorStoreAdapter flags outdated embedding model accurately
        class StubEmb:
            provider_name = "ollama"
            model_name = "old-embed-v1"

            async def embed_texts(self, texts: Any) -> list[list[float]]:
                return [[1.0, 0.0] for _ in texts]

        vstore = SovereignVectorStoreAdapter(persist_dir=str(tmp_path), embedding_provider=StubEmb())
        await vstore.upsert_document_chunks(
            "d1",
            "default",
            [ChunkVO("d1:0", "d1", "default", "a.md", "A", "core", "published", ("A",), "texto")],
        )
        st_same = vstore.get_reindex_status("old-embed-v1")
        assert st_same["needs_reindex"] is False
        st_diff = vstore.get_reindex_status("nomic-embed-text")
        assert st_diff["needs_reindex"] is True and st_diff["chunks_outdated"] == 1

    # Role permission check: Consumer cannot trigger embeddings reindex in enterprise_rbac
    consumer = UserEntity(
        user_id="usr-f2-cons",
        email="f2.cons@contextforge.local",
        full_name="Consumer F2",
        password_hash=c.password_hasher.hash_password("Pass1234!"),
        role=UserRole.CONSUMER,
    )
    await c.user_repo.save_user(consumer)
    prev_mode = c.settings.env.auth_mode
    object.__setattr__(c.settings.env, "auth_mode", "enterprise_rbac")
    try:
        cons_hdr = {"Authorization": f"Bearer {c.jwt_service.issue_token_pair(consumer)['access_token']}"}
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            r_forbid = await client.post("/api/v1/settings/embeddings/reindex", headers=cons_hdr)
            assert r_forbid.status_code == 403
    finally:
        object.__setattr__(c.settings.env, "auth_mode", prev_mode)
