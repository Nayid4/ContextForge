"""Bloque 4 Tests: Feedback, Auto-Captured Knowledge Gaps, Agent Templates & Evals, HMAC Webhooks, Portable Export/Import & Prometheus /metrics."""

from __future__ import annotations

import hashlib
import hmac
from typing import Any
import httpx
import pytest
from httpx import ASGITransport, AsyncClient

from infrastructure.di import get_container
from main import app


@pytest.mark.asyncio
async def test_feedback_auto_knowledge_gaps_templates_and_continuous_agent_evals() -> None:
    c = get_container()
    await c.initialize_runtime()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1) Agent Templates catalog
        tpls = await client.get("/api/v1/agents/templates")
        assert tpls.status_code == 200
        tpl_ids = {t["template_id"] for t in tpls.json()["items"]}
        assert {"backend_architect", "customer_support", "security_auditor", "engineering_onboarding"}.issubset(tpl_ids)

        # 2) Publish a known document & create an agent
        await client.post(
            "/api/v1/documents",
            json={
                "project_slug": "default",
                "path": "ops/backup_policy.md",
                "title": "Politica de Respaldos",
                "module_name": "ops",
                "content_markdown": "# Respaldos\nLos respaldos cifrados diarios se retienen por 30 dias en almacenamiento inmutable.",
                "status": "published",
            },
        )
        ag_res = await client.post(
            "/api/v1/projects/default/agents",
            json={
                "name": "Ops Eval Bot",
                "slug": "ops-eval-bot",
                "llm_provider": "extractive_fallback",
                "llm_model": "extractive-v2",
                "min_grounding_score": 0.15,
            },
        )
        assert ag_res.status_code == 201

        # 3) Asking an undocumented question triggers BR-08 abstention AND auto-records a clustered knowledge gap!
        unanswered = await client.post(
            "/api/v1/projects/default/agents/ops-eval-bot/chat",
            json={"question": "zzzqwx vvvkkj yyybbn?"},
        )
        assert unanswered.status_code == 200
        assert unanswered.json()["grounded"] is False

        gaps = await client.get("/api/v1/projects/default/knowledge-gaps?status=open")
        assert gaps.status_code == 200
        gap_items = gaps.json()["items"]
        assert any("zzzqwx" in g["topic_cluster"] for g in gap_items)
        q_gap_id = next(g["gap_id"] for g in gap_items if "zzzqwx" in g["topic_cluster"])

        # Resolve the gap
        res_gap = await client.patch(f"/api/v1/projects/default/knowledge-gaps/{q_gap_id}/resolve")
        assert res_gap.status_code == 200 and res_gap.json()["resolved"] is True

        # 4) Submit thumbs-up and thumbs-down feedback
        fb_up = await client.post(
            "/api/v1/projects/default/feedback",
            json={"agent_slug": "ops-eval-bot", "question": "Cuantos dias se retienen respaldos?", "vote": "up"},
        )
        assert fb_up.status_code == 201
        fb_list = await client.get("/api/v1/projects/default/feedback")
        assert fb_list.status_code == 200
        assert fb_list.json()["summary"]["up"] >= 1

        # 5) Continuous Agent Evaluation suite (add test case + run evals)
        ev_add = await client.post(
            "/api/v1/projects/default/agents/ops-eval-bot/evals",
            json={
                "question": "Por cuantos dias se retienen los respaldos cifrados?",
                "expected_citation_path": "ops/backup_policy.md",
                "expected_substring": "30 dias",
            },
        )
        assert ev_add.status_code == 201
        case_id = ev_add.json()["case_id"]

        ev_run = await client.post("/api/v1/projects/default/agents/ops-eval-bot/evals/run")
        assert ev_run.status_code == 200
        rep = ev_run.json()
        assert rep["total"] == 1
        assert rep["passed"] == 1
        assert rep["pass_rate"] == 100.0
        assert rep["results"][0]["citation_matched"] is True
        assert rep["results"][0]["substring_matched"] is True

        del_ev = await client.delete(f"/api/v1/projects/default/agents/ops-eval-bot/evals/{case_id}")
        assert del_ev.status_code == 200 and del_ev.json()["deleted"] is True

        await client.delete("/api/v1/projects/default/agents/ops-eval-bot")


@pytest.mark.asyncio
async def test_webhooks_hmac_dispatch_project_export_import_and_prometheus_metrics(monkeypatch: pytest.MonkeyPatch) -> None:
    c = get_container()
    await c.initialize_runtime()

    delivered: list[dict[str, Any]] = []

    class FakeWhResp:
        status_code = 200

    orig_post = httpx.AsyncClient.post

    async def fake_post(self: Any, url: str, **kwargs: Any) -> Any:
        if str(url).startswith("https://hooks.example.com"):
            delivered.append({"url": url, "content": kwargs.get("content", b""), "headers": kwargs.get("headers", {})})
            return FakeWhResp()
        return await orig_post(self, url, **kwargs)

    monkeypatch.setattr(httpx.AsyncClient, "post", fake_post)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1) Register a signed webhook on 'default' and publish a doc -> HMAC-SHA256 webhook fires!
        wh_res = await client.post(
            "/api/v1/projects/default/webhooks",
            json={"url": "https://hooks.example.com/cf", "events": ["document.published"], "secret": "whsec_test123"},
        )
        assert wh_res.status_code == 201
        wh_id = wh_res.json()["webhook_id"]

        await client.post(
            "/api/v1/documents",
            json={
                "project_slug": "default",
                "path": "ops/webhook_trigger_test.md",
                "title": "Prueba Webhook",
                "module_name": "ops",
                "content_markdown": "# Webhook\nDocumento publicado para probar firma HMAC.",
                "status": "published",
            },
        )
        assert len(delivered) >= 1
        last_call = delivered[-1]
        assert last_call["url"] == "https://hooks.example.com/cf"
        ts = last_call["headers"]["X-ContextForge-Timestamp"]
        assert ts.isdigit()
        signed_bytes = f"{ts}.".encode("utf-8") + last_call["content"]
        expected_sig = "sha256=" + hmac.new(b"whsec_test123", signed_bytes, hashlib.sha256).hexdigest()
        assert last_call["headers"]["X-ContextForge-Signature"] == expected_sig
        assert last_call["headers"]["X-ContextForge-Event"] == "document.published"

        await client.delete(f"/api/v1/projects/default/webhooks/{wh_id}")

        # 2) Export 'default' project as portable JSON bundle & re-import under a new slug 'cloned-demo'
        exp = await client.get("/api/v1/projects/default/export")
        assert exp.status_code == 200
        bundle = exp.json()
        assert bundle["format"] == "contextforge.project.bundle.v1"
        assert len(bundle["documents"]) >= 1

        bundle["project"]["slug"] = "cloned-demo"
        bundle["project"]["name"] = "Cloned Portable Project"
        imp = await client.post("/api/v1/projects/import", json=bundle)
        assert imp.status_code == 201
        assert imp.json()["project_slug"] == "cloned-demo"
        assert imp.json()["documents_imported"] >= 1

        # Verify imported docs are searchable in the new project
        cloned_docs = await client.get("/api/v1/projects/cloned-demo/documents")
        assert cloned_docs.status_code == 200
        assert cloned_docs.json()["total_count"] >= 1

        # 3) Prometheus /metrics exposition endpoint
        m_resp = await client.get("/metrics")
        assert m_resp.status_code == 200
        assert "text/plain" in m_resp.headers["content-type"]
        assert "contextforge_projects_total" in m_resp.text
        assert "contextforge_rag_queries_total" in m_resp.text
        assert "contextforge_http_requests_total" in m_resp.text
