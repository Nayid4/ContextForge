"""Phase 3 Knowledge Cycle Tests (BR-24): Stewards, Freshness, Gaps Assign/Ignore/Bulk/Draft/Auto-Resolve, Health Dashboard & Editor from_gap."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
import pytest
from httpx import ASGITransport, AsyncClient

from domain.users import UserEntity, UserRole
from infrastructure.di import get_container
from main import app


@pytest.mark.asyncio
async def test_knowledge_gaps_lifecycle_bulk_draft_auto_resolve_stewards_and_health() -> None:
    c = get_container()
    await c.initialize_runtime()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1) Report two knowledge gaps
        g1 = await client.post(
            "/api/v1/projects/default/knowledge-gaps/report",
            json={"agent_slug": "assistant", "question": "Como rotar certificados mTLS kafka?"},
        )
        assert g1.status_code == 201
        gap1_id = g1.json()["gap_id"]

        g2 = await client.post(
            "/api/v1/projects/default/knowledge-gaps/report",
            json={"agent_slug": "assistant", "question": "Cual es el menu del comedor?"},
        )
        assert g2.status_code == 201
        gap2_id = g2.json()["gap_id"]

        # 2) Assign gap1, generate draft & open editor prefilled with ?from_gap=
        asgn = await client.patch(
            f"/api/v1/projects/default/knowledge-gaps/{gap1_id}/assign",
            json={"assigned_to": "usr-curator"},
        )
        assert asgn.status_code == 200 and asgn.json()["assigned_to"] == "usr-curator"

        draft = await client.post(f"/api/v1/projects/default/knowledge-gaps/{gap1_id}/draft")
        assert draft.status_code == 200
        assert "## Debe responder" in draft.json()["draft_markdown"]
        assert "mTLS" in draft.json()["draft_markdown"]

        ed_html = await client.get(f"/books/editor?project=default&from_gap={gap1_id}")
        assert ed_html.status_code == 200
        assert "Debe responder" in ed_html.text

        # 3) Ignore gap2 with mandatory reason (short reason rejected)
        bad_ign = await client.patch(f"/api/v1/projects/default/knowledge-gaps/{gap2_id}/ignore", json={"reason": "x"})
        assert bad_ign.status_code == 422
        ok_ign = await client.patch(
            f"/api/v1/projects/default/knowledge-gaps/{gap2_id}/ignore",
            json={"reason": "Fuera de alcance técnico del proyecto"},
        )
        assert ok_ign.status_code == 200 and ok_ign.json()["ignored"] is True

        # 4) Publish a document covering gap1's topic -> AUTO-RESOLVES gap1 (BR-24)!
        pub = await client.post(
            "/api/v1/documents",
            json={
                "project_slug": "default",
                "path": "ops/kafka_mtls_rotation.md",
                "title": "Rotación de certificados mTLS Kafka",
                "module_name": "ops",
                "content_markdown": "# Rotar certificados mTLS Kafka\nEjecuta el script de rotación de certificados mTLS cada 90 días.",
                "status": "published",
            },
        )
        assert pub.status_code in (200, 201)
        resolved_gap = await c.feedback_repo.get_gap(gap1_id)
        assert resolved_gap is not None
        assert resolved_gap.status == "resolved"
        assert resolved_gap.resolved_by_doc_path == "ops/kafka_mtls_rotation.md"

        # 5) Document Steward & Freshness governance + Health Dashboard
        gov = await client.patch(
            "/api/v1/projects/default/documents/governance",
            json={"path": "ops/kafka_mtls_rotation.md", "steward_user_id": "usr-curator", "review_interval_days": 30, "mark_reviewed": True},
        )
        assert gov.status_code == 200
        assert gov.json()["steward_user_id"] == "usr-curator"
        assert gov.json()["freshness_status"] == "fresh"

        # Backdate last_reviewed_at beyond 30 days to verify expired detection
        doc_ent = await c.doc_repo.get_by_path("ops/kafka_mtls_rotation.md", project_slug="default")
        assert doc_ent is not None
        doc_ent.last_reviewed_at = datetime.now(timezone.utc) - timedelta(days=45)
        await c.doc_repo.save(doc_ent, write_to_disk=False)

        health = await client.get("/api/v1/projects/default/knowledge-health")
        assert health.status_code == 200
        hdata = health.json()
        assert hdata["expired_docs_count"] >= 1
        assert any(d["path"] == "ops/kafka_mtls_rotation.md" for d in hdata["expired_docs"])

        # 6) Bulk action on new gap + /knowledge-health web page renders 200
        g3 = await client.post(
            "/api/v1/projects/default/knowledge-gaps/report",
            json={"agent_slug": "assistant", "question": "Politica retencion logs auditoria?"},
        )
        bulk = await client.post(
            "/api/v1/projects/default/knowledge-gaps/bulk",
            json={"action": "resolve", "gap_ids": [g3.json()["gap_id"]]},
        )
        assert bulk.status_code == 200 and bulk.json()["affected"] == 1

        kh_html = await client.get("/knowledge-health")
        assert kh_html.status_code == 200 and "Documentar este vacío" in kh_html.text

    # 7) Role permission check: Consumer cannot assign/ignore gaps or update governance
    cons = UserEntity(
        user_id="usr-f3-cons",
        email="f3.cons@contextforge.local",
        full_name="Consumer F3",
        password_hash=c.password_hasher.hash_password("Pass1234!"),
        role=UserRole.CONSUMER,
    )
    await c.user_repo.save_user(cons)
    prev_mode = c.settings.env.auth_mode
    object.__setattr__(c.settings.env, "auth_mode", "enterprise_rbac")
    try:
        cons_hdr = {"Authorization": f"Bearer {c.jwt_service.issue_token_pair(cons)['access_token']}"}
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            r1 = await client.patch(f"/api/v1/projects/default/knowledge-gaps/{gap1_id}/assign", headers=cons_hdr, json={"assigned_to": "x"})
            assert r1.status_code == 403
            r2 = await client.patch("/api/v1/projects/default/documents/governance", headers=cons_hdr, json={"path": "ops/kafka_mtls_rotation.md", "mark_reviewed": True})
            assert r2.status_code == 403
    finally:
        object.__setattr__(c.settings.env, "auth_mode", prev_mode)
