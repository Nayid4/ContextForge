"""Operations REST v1 Router: Answer Feedback, Knowledge Gaps, Webhooks & Portable Project Export/Import (0 classes)."""

from __future__ import annotations

import re
from typing import Any
import uuid
from fastapi import APIRouter, Depends, Query, Request

from domain.agents import AgentEntity, AgentEvalCaseEntity
from domain.common import DomainError, DomainException
from domain.documents import DocumentAggregate, EditorialStatus
from domain.projects import ProjectEntity, WebhookEntity
from domain.rag import AnswerFeedbackEntity
from domain.users import AuthPrincipal, DlpRedactionStrategy, PermissionAction
from infrastructure.di import DependencyContainer, get_container
from presentation.api.dependencies import require_permission
from presentation.api.v1.schemas.answer_feedback_payload import AnswerFeedbackPayload
from presentation.api.v1.schemas.knowledge_gap_report_payload import KnowledgeGapReportPayload
from presentation.api.v1.schemas.project_import_payload import ProjectImportPayload
from presentation.api.v1.schemas.webhook_create_payload import WebhookCreatePayload

router = APIRouter(tags=["Operations: Feedback, Knowledge Gaps, Webhooks & Export/Import"])


# --- Answer Feedback (Thumbs Up/Down) ---
@router.post("/projects/{slug}/feedback", status_code=201)
async def submit_answer_feedback(
    slug: str,
    payload: AnswerFeedbackPayload,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.SEARCH_AND_ASK, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    safe_q, _ = DlpRedactionStrategy.redact(payload.question.strip(), redact_emails=True)
    safe_ans, _ = DlpRedactionStrategy.redact(payload.answer_excerpt.strip()[:400], redact_emails=True)
    safe_reason, _ = DlpRedactionStrategy.redact(payload.reason.strip(), redact_emails=True)
    ent = AnswerFeedbackEntity(
        feedback_id=str(uuid.uuid4()),
        project_slug=slug,
        agent_slug=payload.agent_slug.strip(),
        question=safe_q,
        answer_excerpt=safe_ans,
        vote=payload.vote,
        reason=safe_reason,
        user_id=principal.subject_id,
    )
    saved = await c.feedback_repo.save_feedback(ent)
    if payload.vote == "down":
        await c.feedback_repo.record_gap(project_slug=slug, agent_slug=saved.agent_slug, question=saved.question)
    return {
        "feedback_id": saved.feedback_id,
        "project_slug": saved.project_slug,
        "vote": saved.vote,
        "created_at": saved.created_at.isoformat(),
    }


@router.get("/projects/{slug}/feedback")
async def list_answer_feedback(
    slug: str,
    limit: int = Query(50, ge=1, le=200),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    items = await c.feedback_repo.list_feedback(slug, limit=limit)
    up_cnt = sum(1 for i in items if i.vote == "up")
    down_cnt = sum(1 for i in items if i.vote == "down")
    return {
        "project_slug": slug,
        "summary": {"up": up_cnt, "down": down_cnt, "total": len(items)},
        "items": [
            {
                "feedback_id": i.feedback_id,
                "agent_slug": i.agent_slug,
                "question": i.question,
                "vote": i.vote,
                "reason": i.reason,
                "user_id": i.user_id,
                "created_at": i.created_at.isoformat(),
            }
            for i in items
        ],
    }


# --- Knowledge Gaps Panel (Unanswered Questions Clustered by Topic) ---
@router.get("/projects/{slug}/knowledge-gaps")
async def list_knowledge_gaps(
    slug: str,
    status: str | None = Query(None),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    gaps = await c.feedback_repo.list_gaps(slug, status=status)
    return {
        "project_slug": slug,
        "open_count": sum(1 for g in gaps if g.status == "open"),
        "items": [
            {
                "gap_id": g.gap_id,
                "agent_slug": g.agent_slug,
                "question": g.question,
                "topic_cluster": g.topic_cluster,
                "occurrences": g.occurrences,
                "status": g.status,
                "last_asked_at": g.last_asked_at.isoformat(),
            }
            for g in gaps
        ],
    }


@router.post("/projects/{slug}/knowledge-gaps/report", status_code=201)
async def report_knowledge_gap(
    slug: str,
    payload: KnowledgeGapReportPayload,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.SEARCH_AND_ASK, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    safe_q, _ = DlpRedactionStrategy.redact(payload.question.strip(), redact_emails=True)
    gap = await c.feedback_repo.record_gap(
        project_slug=slug,
        agent_slug=payload.agent_slug.strip(),
        question=safe_q,
    )
    return {
        "gap_id": gap.gap_id,
        "topic_cluster": gap.topic_cluster,
        "occurrences": gap.occurrences,
        "status": gap.status,
    }


@router.patch("/projects/{slug}/knowledge-gaps/{gap_id}/resolve")
async def resolve_knowledge_gap(
    slug: str,
    gap_id: str,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    ok = await c.feedback_repo.resolve_gap(gap_id)
    if not ok:
        raise DomainException(DomainError.not_found("gap_not_found", f"Vacío documental '{gap_id}' no encontrado."))
    return {"resolved": True, "gap_id": gap_id}


# --- Project Webhooks (HMAC-SHA256 Signed) ---
@router.get("/projects/{slug}/webhooks")
async def list_project_webhooks(
    slug: str,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    hooks = await c.webhook_repo.list_webhooks(slug)
    return {
        "project_slug": slug,
        "items": [
            {
                "webhook_id": h.webhook_id,
                "url": h.url,
                "events": list(h.events),
                "has_secret": bool(h.secret_encrypted or h.secret),
                "is_active": h.is_active,
                "created_at": h.created_at.isoformat(),
            }
            for h in hooks
        ],
    }


@router.post("/projects/{slug}/webhooks", status_code=201)
async def create_project_webhook(
    slug: str,
    payload: WebhookCreatePayload,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    if not c.webhook_dispatcher.is_valid_url(payload.url):
        raise DomainException(
            DomainError.validation(
                "invalid_webhook_url",
                "URL de webhook inválida: se exige https:// público y no se permiten direcciones locales, privadas ni reservadas (BR-22).",
            )
        )
    plain_secret = payload.secret.strip()
    enc_secret = c.vault.encrypt(plain_secret) if plain_secret else ""
    wh = WebhookEntity(
        webhook_id=str(uuid.uuid4()),
        project_slug=slug,
        url=payload.url.strip(),
        events=tuple(e.strip() for e in payload.events if e.strip()) or ("document.published", "document.indexed"),
        secret="",
        secret_encrypted=enc_secret,
        is_active=True,
    )
    saved = await c.webhook_repo.save_webhook(wh)
    await c.event_store.append_audit(
        actor_id=principal.subject_id,
        role=principal.role.value,
        project_slug=slug,
        operation="webhook.create",
        resource_id=saved.webhook_id,
        succeeded=True,
        latency_ms=0.0,
        client_ip=request.client.host if request.client else "local",
    )
    return {
        "webhook_id": saved.webhook_id,
        "project_slug": saved.project_slug,
        "url": saved.url,
        "events": list(saved.events),
        "has_secret": bool(saved.secret_encrypted),
    }


@router.delete("/projects/{slug}/webhooks/{webhook_id}")
async def delete_project_webhook(
    slug: str,
    webhook_id: str,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    deleted = await c.webhook_repo.delete_webhook(slug, webhook_id)
    await c.event_store.append_audit(
        actor_id=principal.subject_id,
        role=principal.role.value,
        project_slug=slug,
        operation="webhook.delete",
        resource_id=webhook_id,
        succeeded=deleted,
        latency_ms=0.0,
        client_ip=request.client.host if request.client else "local",
    )
    return {"deleted": deleted, "webhook_id": webhook_id}


# --- Portable Full Project Export / Import ---
@router.get("/projects/{slug}/export")
async def export_project_bundle(
    slug: str,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    proj = await c.project_repo.get_by_slug(slug)
    if proj is None:
        raise DomainException(DomainError.not_found("project_not_found", f"Proyecto '{slug}' no encontrado."))
    docs = await c.doc_repo.list_all(project_slug=slug)
    agents = await c.agent_repo.list_all(project_slug=slug)
    eval_cases: list[dict[str, Any]] = []
    for ag in agents:
        for ev in await c.agent_repo.list_eval_cases(ag.agent_id):
            eval_cases.append(
                {
                    "agent_slug": ag.slug,
                    "question": ev.question,
                    "expected_citation_path": ev.expected_citation_path,
                    "expected_substring": ev.expected_substring,
                }
            )
    await c.event_store.append_audit(
        actor_id=principal.subject_id,
        role=principal.role.value,
        project_slug=slug,
        operation="project.export",
        resource_id=slug,
        succeeded=True,
        latency_ms=0.0,
        client_ip=request.client.host if request.client else "local",
    )
    return {
        "format": "contextforge.project.bundle.v1",
        "excluded_sensitive_resources": ["webhooks", "api_keys", "llm_secrets"],
        "project": {
            "slug": proj.slug,
            "name": proj.name,
            "description": proj.description,
            "sovereign_only": proj.sovereign_only,
            "max_quota_mb": proj.max_quota_mb,
        },
        "documents": [
            {
                "path": d.path,
                "title": d.title,
                "module_name": d.module_name,
                "tags": list(d.tags),
                "status": d.status.value,
                "summary": d.summary,
                "content_markdown": d.content_markdown,
            }
            for d in docs
        ],
        "agents": [
            {
                "slug": a.slug,
                "name": a.name,
                "description": a.description,
                "system_prompt": a.system_prompt,
                "llm_provider": a.llm_provider,
                "llm_model": a.llm_model,
                "temperature": a.temperature,
                "max_tokens": a.max_tokens,
                "top_k": a.top_k,
                "min_grounding_score": a.min_grounding_score,
                "allowed_modules": list(a.allowed_modules),
                "allowed_tags": list(a.allowed_tags),
                "allowed_statuses": list(a.allowed_statuses),
                "welcome_message": a.welcome_message,
                "suggested_questions": list(a.suggested_questions),
                "topic_boundaries": a.topic_boundaries,
                "visibility": a.visibility,
                "daily_quota_requests": a.daily_quota_requests,
            }
            for a in agents
        ],
        "eval_cases": eval_cases,
    }


@router.post("/projects/import", status_code=201)
async def import_project_bundle(
    payload: ProjectImportPayload,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.MANAGE_PROJECTS)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    raw_proj = payload.project
    slug = str(raw_proj.get("slug") or "").strip().lower()
    if not slug or not re.fullmatch(r"[a-z0-9][a-z0-9_-]{0,63}", slug):
        raise DomainException(DomainError.validation("invalid_project_slug", "El paquete debe incluir un project.slug válido ([a-z0-9_-])."))
    if len(payload.documents) > 500:
        raise DomainException(DomainError.validation("import_documents_limit", "El paquete excede el límite máximo de 500 documentos."))
    if len(payload.agents) > 50:
        raise DomainException(DomainError.validation("import_agents_limit", "El paquete excede el límite máximo de 50 agentes."))
    if len(payload.eval_cases) > 200:
        raise DomainException(DomainError.validation("import_evals_limit", "El paquete excede el límite máximo de 200 casos de evaluación."))
    total_md_bytes = 0
    for d in payload.documents:
        raw_p = str(d.get("path") or "").strip()
        if not raw_p:
            continue
        if raw_p.startswith(("/", "\\")) or ".." in raw_p.replace("\\", "/").split("/") or "\x00" in raw_p or "\\" in raw_p:
            raise DomainException(DomainError.validation("invalid_import_path", f"Ruta de documento insegura en paquete de importación: '{raw_p}'."))
        total_md_bytes += len(str(d.get("content_markdown") or "").encode("utf-8"))
    if total_md_bytes > 25_000_000:
        raise DomainException(DomainError.payload_too_large("import_payload_too_large", "El contenido Markdown del paquete supera el máximo permitido de 25 MB."))
    existing_proj = await c.project_repo.get_by_slug(slug)
    if existing_proj is None:
        new_proj = ProjectEntity(
            slug=slug,
            owner_id=principal.subject_id,
            name=str(raw_proj.get("name") or slug),
            description=str(raw_proj.get("description") or ""),
            path=f"{c.settings.db.docs_root_path.rstrip('/')}/{slug}",
            sovereign_only=bool(raw_proj.get("sovereign_only", False)),
            max_quota_mb=int(raw_proj.get("max_quota_mb", 2048)),
            is_active=True,
        )
        await c.project_repo.save(new_proj)

    docs_imported = 0
    for d in payload.documents:
        path = str(d.get("path") or "").strip()
        if not path:
            continue
        # Security (F2 / BR-22): imported documents ALWAYS enter as 'draft' until reviewed and explicitly published.
        existing_doc = await c.doc_repo.get_by_path(path, project_slug=slug)
        if existing_doc is None:
            res = DocumentAggregate.create(
                project_slug=slug,
                path=path,
                title=str(d.get("title") or path),
                content_markdown=str(d.get("content_markdown") or ""),
                module_name=str(d.get("module_name") or "general"),
                author=principal.display_name,
                tags=tuple(d.get("tags") or ()),
                status=EditorialStatus.DRAFT,
                summary=str(d.get("summary") or ""),
            )
            if not res.is_error:
                agg, ver = res.value
                await c.doc_repo.save(agg, ver)
                docs_imported += 1

    agents_imported = 0
    agent_id_by_slug: dict[str, str] = {}
    for a in payload.agents:
        ag_slug = str(a.get("slug") or "").strip()
        if not ag_slug:
            continue
        ent = AgentEntity.create(
            project_slug=slug,
            name=str(a.get("name") or ag_slug),
            slug=ag_slug,
            description=str(a.get("description") or ""),
            system_prompt=str(a.get("system_prompt") or ""),
            llm_provider=str(a.get("llm_provider") or ""),
            llm_model=str(a.get("llm_model") or ""),
            temperature=float(a.get("temperature", 0.2)),
            max_tokens=int(a.get("max_tokens", 2048)),
            top_k=int(a.get("top_k", 6)),
            min_grounding_score=float(a.get("min_grounding_score", 0.15)),
            allowed_modules=tuple(a.get("allowed_modules") or ()),
            allowed_tags=tuple(a.get("allowed_tags") or ()),
            allowed_statuses=tuple(a.get("allowed_statuses") or ("published",)),
            welcome_message=str(a.get("welcome_message") or ""),
            suggested_questions=tuple(a.get("suggested_questions") or ()),
            topic_boundaries=str(a.get("topic_boundaries") or ""),
            # Security (BR-22): force imported agents to 'private' until an administrator explicitly reviews and publishes them.
            visibility="private",
            daily_quota_requests=max(10, min(100000, int(a.get("daily_quota_requests", 500)))),
        )
        saved_ag = await c.agent_repo.save(ent, author_id=principal.subject_id, change_summary="Importado desde paquete portable")
        agent_id_by_slug[saved_ag.slug] = saved_ag.agent_id
        agents_imported += 1

    evals_imported = 0
    for ev in payload.eval_cases:
        ag_id = agent_id_by_slug.get(str(ev.get("agent_slug") or ""))
        if not ag_id:
            continue
        await c.agent_repo.save_eval_case(
            AgentEvalCaseEntity(
                case_id=str(uuid.uuid4()),
                agent_id=ag_id,
                project_slug=slug,
                question=str(ev.get("question") or ""),
                expected_citation_path=str(ev.get("expected_citation_path") or ""),
                expected_substring=str(ev.get("expected_substring") or ""),
            )
        )
        evals_imported += 1

    await c.event_store.append_audit(
        actor_id=principal.subject_id,
        role=principal.role.value,
        project_slug=slug,
        operation="project.import",
        resource_id=slug,
        succeeded=True,
        latency_ms=0.0,
        client_ip=request.client.host if request.client else "local",
    )
    return {
        "imported": True,
        "project_slug": slug,
        "documents_imported": docs_imported,
        "documents_status": "draft",
        "agents_imported": agents_imported,
        "agents_visibility": "private",
        "eval_cases_imported": evals_imported,
    }
