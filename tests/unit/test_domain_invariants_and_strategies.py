from __future__ import annotations
from pathlib import Path
from domain.bundles import BundleCandidateDocVO, ContextBundleEntity
from domain.collaboration import sanitize_comment_text, validate_rating_score
from domain.documents import (
    DocumentAggregate,
    EditorialStateMachine,
    EditorialStatus,
    compute_unified_diff,
    validate_attachment_policy,
)
from domain.projects import ProjectEntity, validate_safe_relative_path
from domain.rag import GroundingPolicy, HybridFusionStrategy, SearchHitVO, SovereignRoutingPolicy
from domain.users import AuthPrincipal, DlpRedactionStrategy, PermissionAction, UserRole


def test_br01_and_br03_project_slug_and_path_traversal(tmp_path: Path) -> None:
    bad_slug = ProjectEntity.create(name="Proyecto", slug="INVALID SLUG!!", path="./docs")
    assert bad_slug.is_error and bad_slug.first_error.code == "invalid_project_slug"
    good_slug = ProjectEntity.create(name="Pagos Core", slug="pagos-core", path="./docs/pagos")
    assert not good_slug.is_error and good_slug.value.slug == "pagos-core"
    too_short = ProjectEntity.create(name="A", slug="a", path="./docs")
    assert too_short.is_error

    traversal = validate_safe_relative_path("../../etc/passwd", allowed_root=tmp_path)
    assert traversal.is_error and traversal.first_error.code == "path_traversal_detected"


def test_br02_br04_br05_br06_br11_document_lifecycle_concurrency_and_rollback() -> None:
    empty_res = DocumentAggregate.create(project_slug="default", path="a.md", title="", content_markdown="x")
    assert empty_res.is_error and empty_res.first_error.code == "non_empty_title"

    ok_res = DocumentAggregate.create(
        project_slug="default",
        path="eng/spec.md",
        title="Spec Inicial",
        content_markdown="# V1\nRegla inicial.",
        status=EditorialStatus.DRAFT,
    )
    assert not ok_res.is_error
    doc, v1 = ok_res.value

    # BR-04: DRAFT is NOT eligible for productive RAG
    assert not EditorialStateMachine.is_rag_eligible(doc.status, include_drafts=False)
    assert EditorialStateMachine.is_rag_eligible(doc.status, include_drafts=True)

    # BR-05: Valid transitions DRAFT -> IN_REVIEW -> PUBLISHED -> DEPRECATED
    t1 = doc.transition_to(EditorialStatus.IN_REVIEW, actor="curator")
    assert not t1.is_error and doc.status == EditorialStatus.IN_REVIEW
    t2 = doc.transition_to(EditorialStatus.PUBLISHED, actor="curator")
    assert not t2.is_error and doc.status == EditorialStatus.PUBLISHED
    assert EditorialStateMachine.is_rag_eligible(doc.status)

    # BR-11: Optimistic concurrency check on stale expected_version
    stale = doc.apply_edit(title="Spec V2", content_markdown="# V2\nNueva regla.", expected_version=1)
    assert stale.is_error and stale.first_error.code == "concurrent_modification"

    valid_edit = doc.apply_edit(title="Spec V2", content_markdown="# V2\nNueva regla.", expected_version=doc.current_version)
    assert not valid_edit.is_error
    v_latest = valid_edit.value

    # BR-06: Unified diff & non-destructive sequential rollback
    diff_txt, added, removed = compute_unified_diff(v1.content_markdown, v_latest.content_markdown, "v1", "vLatest")
    assert "+# V2" in diff_txt and added >= 1 and removed >= 1

    rb = doc.rollback_to_snapshot(v1, actor="curator", reason="Restaurar línea base aprobada")
    assert not rb.is_error and doc.content_markdown == "# V1\nRegla inicial."
    assert rb.value.version_number > v_latest.version_number

    # BR-05: DEPRECATED becomes strictly read-only
    doc.transition_to(EditorialStatus.DEPRECATED, actor="admin")
    locked_edit = doc.apply_edit(title="Intento", content_markdown="No permitido")
    assert locked_edit.is_error and locked_edit.first_error.code == "deprecated_document_readonly"


def test_br07_br08_br13_rag_fusion_abstention_sovereignty_and_dlp() -> None:
    h1 = SearchHitVO("c1", "d1", "default", "a.md", "Doc A", "eng", ("H1",), "Texto A", 4.2, "lexical")
    h2 = SearchHitVO("c1", "d1", "default", "a.md", "Doc A", "eng", ("H1",), "Texto A", 0.91, "vector")
    h3 = SearchHitVO("c2", "d2", "default", "b.md", "Doc B", "eng", (), "Texto B", 0.55, "vector")

    rrf = HybridFusionStrategy.fuse_rrf([h1], [h2, h3], top_k=2)
    assert rrf[0].chunk_id == "c1" and rrf[0].source_type == "hybrid"

    weighted = HybridFusionStrategy.fuse_weighted([h1], [h2, h3], top_k=2)
    assert weighted[0].chunk_id == "c1"

    # BR-08: Abstention when hits below threshold
    low_hit = SearchHitVO("c9", "d9", "default", "z.md", "Z", "eng", (), "Irrelevante", 0.05, "vector")
    assert not GroundingPolicy.has_sufficient_evidence([low_hit], min_score=0.15)

    # BR-13: Sovereign routing blocks external cloud URLs
    blocked = SovereignRoutingPolicy.check_provider_allowed(
        project_sovereign_only=True, provider_engine_type="cloud_api", base_url="https://api.openai.com/v1"
    )
    assert blocked.is_error and blocked.first_error.code == "sovereign_policy_violation"
    allowed_local = SovereignRoutingPolicy.check_provider_allowed(
        project_sovereign_only=True, provider_engine_type="local_http", base_url="http://127.0.0.1:11434"
    )
    assert not allowed_local.is_error

    # DLP redaction (REI-10 / OR-01)
    raw_secret = "Usar token sk-proj1234567890abcdefghij y correo autor@empresa.co"
    clean, count = DlpRedactionStrategy.redact(raw_secret, redact_emails=True)
    assert count == 2 and "sk-proj" not in clean and "autor@empresa.co" not in clean


def test_br09_br16_rbac_xss_and_bundle_budget() -> None:
    docs = [
        BundleCandidateDocVO("d1", "one.md", "Uno", "eng", 1, "h1", "A" * 400),
        BundleCandidateDocVO("d2", "two.md", "Dos", "eng", 1, "h2", "B" * 400),
    ]
    too_small = ContextBundleEntity.compile(project_slug="default", name="B", candidates=docs, max_tokens=30)
    assert too_small.is_error and too_small.first_error.code == "token_budget_too_small"

    ok_bnd = ContextBundleEntity.compile(project_slug="default", name="B", candidates=docs, max_tokens=160, export_format="xml")
    assert not ok_bnd.is_error
    b = ok_bnd.value
    assert b.estimated_tokens <= 160 and "one.md" in b.included_paths and "two.md" in b.omitted_paths
    assert "<bundle" in b.content

    # BR-16: Executable attachments rejected
    exe_res = validate_attachment_policy("malware.exe", 1024)
    assert exe_res.is_error and exe_res.first_error.code == "unsupported_attachment_type"

    # XSS sanitization & rating bounds
    assert "<script>" not in sanitize_comment_text("Hola <script>alert(1)</script> mundo")
    assert validate_rating_score(6).is_error

    # RBAC & project scoping
    agent = AuthPrincipal("ag-1", "Bot", "", UserRole.AGENT_CLIENT, allowed_projects=("pagos",), auth_scheme="api_key")
    assert agent.can_perform(PermissionAction.WRITE_DOCUMENT, "pagos").is_error
    assert agent.can_perform(PermissionAction.READ_KNOWLEDGE, "otro-proyecto").is_error
    assert not agent.can_perform(PermissionAction.READ_KNOWLEDGE, "pagos").is_error
