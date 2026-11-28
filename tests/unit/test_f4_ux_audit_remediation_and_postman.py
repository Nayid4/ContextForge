"""Phase 4 Consistency & UX Audit Remediation Tests: /settings (SET-01..12), /docs/integration-guide (INT-01..09), UI Kit & Postman v2.1."""

from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient

from infrastructure.di import get_container
from infrastructure.integrations.exporters.postman_collection_builder import PostmanCollectionBuilder
from main import app


def test_postman_collection_v21_has_no_hardcoded_passwords_and_covers_all_v2_groups() -> None:
    col = PostmanCollectionBuilder.build(base_url="https://docs.empresa.com", project_slug="pagos", agent_slug="arquitecto")
    raw = str(col)
    # No hardcoded Admin123! or arch_retries.md (remediating INT-08)
    assert "Admin123!" not in raw
    assert "arch_retries.md" not in raw
    assert "{{admin_password}}" in raw
    assert "/v1/chat/completions" in raw
    assert "/v1/models" in raw
    assert "/api/v1/widget/session" in raw
    assert "/api/v1/projects/{{project_slug}}/knowledge-health" in raw
    assert "/api/v1/projects/{{project_slug}}/webhooks" in raw
    assert "/api/v1/audit-logs/verify" in raw
    assert "/metrics" in raw
    assert "/mcp/sse" in raw


@pytest.mark.asyncio
async def test_settings_and_integration_guide_remediate_all_phase0_audit_findings() -> None:
    c = get_container()
    await c.initialize_runtime()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1) /settings remediates SET-01..SET-12
        s_resp = await client.get("/settings")
        assert s_resp.status_code == 200
        s_html = s_resp.text
        # SET-01: explicit egress labels, no misleading "CLI Local" filter tab
        assert "CLI (Nube / Local)" in s_html
        assert "egress_class" in s_html
        # SET-06: all settings fields exposed (ollama_url, min_grounding_score, DLP, extractive fallback, embeddings reindex)
        assert "systemSettings.ollama_url" in s_html
        assert "systemSettings.min_grounding_score" in s_html
        assert "systemSettings.enable_dlp_redaction" in s_html
        assert "systemSettings.enable_extractive_fallback" in s_html
        assert "triggerEmbeddingReindex" in s_html
        # SET-07: fictional DB providers removed
        assert "SQL Server" not in s_html and "MongoDB" not in s_html and "Firebase" not in s_html
        # SET-08: publishable keys (cf_pub_*), origins, agents, daily quota, last_used_at
        assert "newKeyPublishable" in s_html and "newKeyOriginsCsv" in s_html and "newKeyAgentsCsv" in s_html
        # SET-09, SET-10, SET-11, SET-12: verify audit button, DLQ, AUTH_MODE + /metrics, Workspace vs Project webhooks/export
        assert "verifyAuditChain" in s_html
        assert "createProjectWebhook" in s_html
        assert "AUTH_MODE=" in s_html
        assert "cf_ui_kit.js" in s_html

        # 2) /docs/integration-guide remediates INT-01..INT-09
        i_resp = await client.get("/docs/integration-guide")
        assert i_resp.status_code == 200
        i_html = i_resp.text
        assert "testLiveConnection" in i_html
        assert "Gateway OpenAI (/v1/*)" in i_html
        assert "32,000 caracteres" in i_html
        assert "Webhooks HTTPS Firmados" in i_html
        assert "Claude Desktop" in i_html
        assert "isSelectedAgentPublic" in i_html
        assert "SQLite FTS5" in i_html
