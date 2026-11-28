"""Stateless Project-Scoped Agents, Versioning, Members, Documents & Hardened Widget Session REST v1 Router (0 classes)."""

from __future__ import annotations

import hashlib
import json
import uuid
from typing import Any
from fastapi import APIRouter, Depends, Query, Request

from application.agents import AgentChatExecutor
from application.documents.queries.ListDocumentsPaginated import ListDocumentsPaginatedQuery
from domain.agents import AgentEntity, AgentEvalCaseEntity, AgentTemplateCatalog
from domain.common import DomainError, DomainException, PageParams
from domain.projects import ProjectMemberEntity
from domain.rag import SovereignRoutingPolicy
from domain.users import AuthPrincipal, PermissionAction, UserRole
from infrastructure.di import DependencyContainer, get_container
from infrastructure.integrations import AIStrategyFactory
from presentation.api.dependencies import require_permission
from presentation.api.v1.schemas.agent_chat_payload import AgentChatPayload
from presentation.api.v1.schemas.agent_eval_case_payload import AgentEvalCasePayload
from presentation.api.v1.schemas.agent_rollback_payload import AgentRollbackPayload
from presentation.api.v1.schemas.agent_write_payload import AgentWritePayload
from presentation.api.v1.schemas.project_member_payload import ProjectMemberPayload
from presentation.api.v1.schemas.widget_session_payload import WidgetSessionPayload

router = APIRouter(tags=["Project Agents, Members & Ephemeral Widget Sessions (AGT)"])


def _serialize_agent(a: AgentEntity, *, include_internals: bool = True, egress: str = "") -> dict[str, Any]:
    base: dict[str, Any] = {
        "agent_id": a.agent_id,
        "project_slug": a.project_slug,
        "slug": a.slug,
        "openai_model_id": a.openai_model_id,
        "name": a.name,
        "description": a.description,
        "visibility": a.visibility,
        "welcome_message": a.welcome_message,
        "suggested_questions": list(a.suggested_questions),
        "current_version": a.current_version,
        "is_active": a.is_active,
        "updated_at": a.updated_at.isoformat(),
    }
    if egress:
        base["egress_destination"] = egress
    if include_internals:
        base.update(
            {
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
                "topic_boundaries": a.topic_boundaries,
                "daily_quota_requests": a.daily_quota_requests,
            }
        )
    return base


def _sanitize_chat_result_for_principal(res: dict[str, Any], principal: AuthPrincipal) -> dict[str, Any]:
    """Limits retrieval inspector chunks & raw excerpts strictly to Curator/Admin (prevents public leakage)."""
    if principal.can_inspect_internals:
        return res
    safe_cits = [
        {"path": c.get("path", ""), "title": c.get("title", ""), "headers": c.get("headers", [])}
        for c in res.get("citations", [])
    ]
    cleaned = dict(res)
    cleaned["citations"] = safe_cits
    cleaned.pop("retrieved_chunks", None)
    cleaned.pop("stripped_citations", None)
    return cleaned


async def _resolve_agent_egress(c: DependencyContainer, llm_provider: str) -> tuple[str, str]:
    cfg = (await c.llm_config_repo.get_by_provider(llm_provider) if llm_provider else None) or await c.llm_config_repo.get_active()
    egress = SovereignRoutingPolicy.classify_egress(
        provider_engine_type=cfg.engine_type,
        base_url=cfg.cli_command if cfg.engine_type == "local_cli" else cfg.base_url,
        provider_name=cfg.provider,
    )
    return cfg.engine_type, egress


async def build_agent_executor(c: DependencyContainer) -> AgentChatExecutor:
    async def _resolve_llm(agent: AgentEntity):
        cfg = (
            await c.llm_config_repo.get_by_provider(agent.llm_provider)
            if agent.llm_provider
            else None
        ) or await c.llm_config_repo.get_active()
        timeout = max(c.settings.ai.timeout_seconds, 60.0) if cfg.engine_type == "local_cli" else max(c.settings.ai.timeout_seconds, 30.0)
        adapter = AIStrategyFactory.create(cfg, c.vault, timeout_sec=timeout)
        eff_model = agent.llm_model or cfg.default_model
        return adapter, eff_model

    return AgentChatExecutor(
        lexical_index=c.lexical_index,
        vector_store=c.vector_store,
        project_repo=c.project_repo,
        settings_repo=c.settings_repo,
        fallback_llm=c.fallback_llm,
        llm_resolver=_resolve_llm,
        chat_repo=c.chat_repo,
        feedback_repo=c.feedback_repo,
        metrics_callback=lambda lat, grd: c.metrics.observe_rag(latency_ms=lat, grounded=grd),
    )


# --- Ready-to-Use Agent Templates ---
@router.get("/agents/templates")
async def list_agent_templates(
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE)),
) -> dict[str, Any]:
    return {"items": AgentTemplateCatalog.list_all()}


# --- Stateless Project-Scoped Documents Endpoint ---
@router.get("/projects/{slug}/documents")
async def list_project_documents_stateless(
    slug: str,
    module: str | None = Query(None),
    status: str | None = Query(None),
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    paged = await c.mediator.execute_or_raise(
        ListDocumentsPaginatedQuery(project_slug=slug, module_name=module, status=status, search=search, page=page, page_size=page_size)
    )
    return {
        "project_slug": slug,
        "items": [
            {
                "id": d.id,
                "path": d.path,
                "title": d.title,
                "module_name": d.module_name,
                "status": d.status.value,
                "current_version": d.current_version,
                "etag": d.etag,
            }
            for d in paged.items
        ],
        "page": paged.page,
        "page_size": paged.page_size,
        "total_count": paged.total_count,
        "total_pages": paged.total_pages,
        "has_prev": paged.has_prev,
        "has_next": paged.has_next,
    }


# --- Project RBAC Membership Endpoints (project_members + BR-23 Last Owner Protection) ---
@router.get("/projects/{slug}/members")
async def list_project_members(
    slug: str,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    members = await c.project_repo.list_members(slug)
    users_map = {u.user_id: u for u in await c.user_repo.list_users()}
    owner_count = sum(1 for m in members if m.role == UserRole.OWNER.value)
    return {
        "project_slug": slug,
        "owner_count": owner_count,
        "items": [
            {
                "member_id": m.member_id,
                "project_slug": m.project_slug,
                "user_id": m.user_id,
                "role": m.role,
                "full_name": users_map[m.user_id].full_name if m.user_id in users_map else m.user_id,
                "email": users_map[m.user_id].email if m.user_id in users_map else "",
                "is_last_owner": m.role == UserRole.OWNER.value and owner_count <= 1,
            }
            for m in members
        ],
    }


@router.post("/projects/{slug}/members", status_code=201)
async def upsert_project_member(
    slug: str,
    payload: ProjectMemberPayload,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.MANAGE_PROJECT_MEMBERS, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    role_res = UserRole.parse(payload.role)
    if role_res.is_error:
        raise DomainException(role_res.first_error)
    existing_members = await c.project_repo.list_members(slug)
    owners = [m for m in existing_members if m.role == UserRole.OWNER.value]
    current = next((m for m in existing_members if m.user_id == payload.user_id), None)
    if current is not None and current.role == UserRole.OWNER.value and role_res.value != UserRole.OWNER and len(owners) <= 1:
        raise DomainException(
            DomainError.conflict(
                "last_owner_protected",
                "No puedes degradar al último Owner del proyecto. Asigna otro Owner primero (BR-23).",
            )
        )
    member = ProjectMemberEntity(
        member_id=str(uuid.uuid4()),
        project_slug=slug,
        user_id=payload.user_id,
        role=role_res.value.value,
    )
    saved = await c.project_repo.upsert_member(member)
    await c.event_store.append_audit(
        actor_id=principal.subject_id,
        role=principal.role.value,
        project_slug=slug,
        operation="project.member_upsert",
        resource_id=f"{slug}:{saved.user_id}:{saved.role}",
        succeeded=True,
        latency_ms=0.0,
        client_ip=request.client.host if request.client else "local",
    )
    return {"member_id": saved.member_id, "project_slug": saved.project_slug, "user_id": saved.user_id, "role": saved.role}


@router.delete("/projects/{slug}/members/{user_id}")
async def remove_project_member(
    slug: str,
    user_id: str,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.MANAGE_PROJECT_MEMBERS, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    existing_members = await c.project_repo.list_members(slug)
    owners = [m for m in existing_members if m.role == UserRole.OWNER.value]
    target = next((m for m in existing_members if m.user_id == user_id), None)
    if target is not None and target.role == UserRole.OWNER.value and len(owners) <= 1:
        raise DomainException(
            DomainError.conflict(
                "last_owner_protected",
                "No puedes eliminar al último Owner del proyecto. Asigna otro Owner primero (BR-23).",
            )
        )
    removed = await c.project_repo.remove_member(slug, user_id)
    await c.event_store.append_audit(
        actor_id=principal.subject_id,
        role=principal.role.value,
        project_slug=slug,
        operation="project.member_remove",
        resource_id=f"{slug}:{user_id}",
        succeeded=removed,
        latency_ms=0.0,
        client_ip=request.client.host if request.client else "local",
    )
    return {"removed": removed, "project_slug": slug, "user_id": user_id}


# --- Live Document Count Preview for Agent Studio ---
@router.get("/projects/{slug}/agents/preview-doc-count")
async def preview_agent_visible_documents(
    slug: str,
    modules: str = Query(""),
    statuses: str = Query("published"),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    mod_set = {m.strip().lower() for m in modules.split(",") if m.strip()}
    status_set = {s.strip().lower() for s in statuses.split(",") if s.strip()} or {"published"}
    all_docs = await c.doc_repo.list_all(project_slug=slug, only_published=False)
    matched = [
        d
        for d in all_docs
        if d.status.value.lower() in status_set
        and (not mod_set or d.module_name.lower() in mod_set)
    ]
    return {
        "project_slug": slug,
        "matched_documents": len(matched),
        "total_project_documents": len(all_docs),
        "sample_paths": [d.path for d in matched[:5]],
    }


# --- First-Class Project Agents CRUD + Versioning + Chat ---
@router.get("/projects/{slug}/agents")
async def list_project_agents(
    slug: str,
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    paged = await c.agent_repo.list_paginated(
        project_slug=slug,
        search=search,
        pagination=PageParams(page=page, page_size=page_size),
    )
    items = []
    for a in paged.items:
        if not principal.can_inspect_internals and principal.can_invoke_agent(slug, a.slug, a.visibility).is_error:
            continue
        _, egress = await _resolve_agent_egress(c, a.llm_provider)
        items.append(_serialize_agent(a, include_internals=principal.can_inspect_internals, egress=egress))
    return {
        "project_slug": slug,
        "items": items,
        "page": paged.page,
        "page_size": paged.page_size,
        "total_count": paged.total_count,
        "total_pages": paged.total_pages,
        "has_prev": paged.has_prev,
        "has_next": paged.has_next,
    }


@router.post("/projects/{slug}/agents", status_code=201)
async def create_project_agent(
    slug: str,
    payload: AgentWritePayload,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    proj = await c.project_repo.get_by_slug(slug)
    if proj is None:
        raise DomainException(DomainError.not_found("project_not_found", f"Proyecto '{slug}' no existe."))
    norm_vis = AgentEntity.normalize_visibility(payload.visibility)
    engine_type, egress = await _resolve_agent_egress(c, payload.llm_provider.strip())
    if norm_vis == "public" and engine_type == "local_cli":
        raise DomainException(
            DomainError.forbidden(
                "public_agent_cli_forbidden",
                "Por seguridad (BR-17/BR-18), un agente con visibility='public' no puede usar motores CLI agénticos.",
            )
        )
    agent = AgentEntity.create(
        project_slug=slug,
        name=payload.name,
        slug=payload.slug,
        description=payload.description,
        system_prompt=payload.system_prompt,
        llm_provider=payload.llm_provider,
        llm_model=payload.llm_model,
        temperature=payload.temperature,
        max_tokens=payload.max_tokens,
        top_k=payload.top_k,
        min_grounding_score=payload.min_grounding_score,
        allowed_modules=tuple(payload.allowed_modules),
        allowed_tags=tuple(payload.allowed_tags),
        allowed_statuses=tuple(payload.allowed_statuses),
        welcome_message=payload.welcome_message,
        suggested_questions=tuple(payload.suggested_questions),
        topic_boundaries=payload.topic_boundaries,
        visibility=norm_vis,
        daily_quota_requests=payload.daily_quota_requests,
    )
    saved = await c.agent_repo.save(agent, author_id=principal.subject_id, change_summary=payload.change_summary or "Creación de agente")
    return _serialize_agent(saved, include_internals=True, egress=egress)


@router.get("/projects/{slug}/agents/{agent_slug}")
async def get_project_agent(
    slug: str,
    agent_slug: str,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    agent = await c.agent_repo.get_by_slug(slug, agent_slug)
    if agent is None:
        raise DomainException(DomainError.not_found("agent_not_found", f"Agente '{slug}/{agent_slug}' no encontrado."))
    if not principal.can_inspect_internals:
        chk = principal.can_invoke_agent(slug, agent_slug, agent.visibility)
        if chk.is_error:
            raise DomainException(chk.first_error)
    _, egress = await _resolve_agent_egress(c, agent.llm_provider)
    return _serialize_agent(agent, include_internals=principal.can_inspect_internals, egress=egress)


@router.put("/projects/{slug}/agents/{agent_slug}")
async def update_project_agent(
    slug: str,
    agent_slug: str,
    payload: AgentWritePayload,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    existing = await c.agent_repo.get_by_slug(slug, agent_slug)
    if existing is None:
        raise DomainException(DomainError.not_found("agent_not_found", f"Agente '{slug}/{agent_slug}' no encontrado."))
    norm_vis = AgentEntity.normalize_visibility(payload.visibility)
    engine_type, egress = await _resolve_agent_egress(c, payload.llm_provider.strip())
    if norm_vis == "public" and engine_type == "local_cli":
        raise DomainException(
            DomainError.forbidden(
                "public_agent_cli_forbidden",
                "Por seguridad (BR-17/BR-18), un agente con visibility='public' no puede usar motores CLI agénticos.",
            )
        )
    max_tok_cap = 4096 if norm_vis == "public" else 16384
    eff_statuses = ("published",) if norm_vis == "public" else (tuple(s.strip().lower() for s in payload.allowed_statuses if s.strip()) or ("published",))
    updated = AgentEntity(
        agent_id=existing.agent_id,
        project_slug=slug,
        slug=agent_slug,
        name=payload.name.strip() or existing.name,
        description=payload.description.strip(),
        system_prompt=payload.system_prompt.strip() or existing.system_prompt,
        llm_provider=payload.llm_provider.strip(),
        llm_model=payload.llm_model.strip(),
        temperature=payload.temperature,
        max_tokens=max(128, min(max_tok_cap, int(payload.max_tokens))),
        top_k=payload.top_k,
        min_grounding_score=payload.min_grounding_score,
        allowed_modules=tuple(m.strip() for m in payload.allowed_modules if m.strip()),
        allowed_tags=tuple(t.strip() for t in payload.allowed_tags if t.strip()),
        allowed_statuses=eff_statuses,
        welcome_message=payload.welcome_message.strip() or existing.welcome_message,
        suggested_questions=tuple(q.strip() for q in payload.suggested_questions if q.strip()),
        topic_boundaries=payload.topic_boundaries.strip(),
        visibility=norm_vis,
        daily_quota_requests=max(10, min(100000, int(payload.daily_quota_requests))),
        current_version=existing.current_version,
        is_active=existing.is_active,
        created_at=existing.created_at,
    )
    saved = await c.agent_repo.save(updated, author_id=principal.subject_id, change_summary=payload.change_summary or "Actualización de configuración")
    return _serialize_agent(saved, include_internals=True, egress=egress)


@router.get("/projects/{slug}/agents/{agent_slug}/versions")
async def list_agent_versions(
    slug: str,
    agent_slug: str,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    agent = await c.agent_repo.get_by_slug(slug, agent_slug)
    if agent is None:
        raise DomainException(DomainError.not_found("agent_not_found", f"Agente '{slug}/{agent_slug}' no encontrado."))
    versions = await c.agent_repo.list_versions(agent.agent_id)
    return {
        "agent_id": agent.agent_id,
        "versions": [
            {
                "version_id": v.version_id,
                "version_number": v.version_number,
                "author_id": v.author_id,
                "change_summary": v.change_summary,
                "created_at": v.created_at.isoformat(),
            }
            for v in versions
        ],
    }


@router.post("/projects/{slug}/agents/{agent_slug}/rollback")
async def rollback_agent_version(
    slug: str,
    agent_slug: str,
    payload: AgentRollbackPayload,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    agent = await c.agent_repo.get_by_slug(slug, agent_slug)
    if agent is None:
        raise DomainException(DomainError.not_found("agent_not_found", f"Agente '{slug}/{agent_slug}' no encontrado."))
    target = await c.agent_repo.get_version(agent.agent_id, payload.target_version)
    if target is None:
        raise DomainException(DomainError.not_found("agent_version_not_found", f"Versión v{payload.target_version} no encontrada."))
    snap = json.loads(target.config_json)
    restored = AgentEntity(
        agent_id=agent.agent_id,
        project_slug=slug,
        slug=agent_slug,
        name=snap.get("name", agent.name),
        description=snap.get("description", ""),
        system_prompt=snap.get("system_prompt", agent.system_prompt),
        llm_provider=snap.get("llm_provider", ""),
        llm_model=snap.get("llm_model", ""),
        temperature=float(snap.get("temperature", 0.2)),
        max_tokens=int(snap.get("max_tokens", 2048)),
        top_k=int(snap.get("top_k", 6)),
        min_grounding_score=float(snap.get("min_grounding_score", 0.15)),
        allowed_modules=tuple(snap.get("allowed_modules", [])),
        allowed_tags=tuple(snap.get("allowed_tags", [])),
        allowed_statuses=tuple(snap.get("allowed_statuses", ["published"])),
        welcome_message=snap.get("welcome_message", agent.welcome_message),
        suggested_questions=tuple(snap.get("suggested_questions", [])),
        topic_boundaries=snap.get("topic_boundaries", ""),
        visibility=AgentEntity.normalize_visibility(snap.get("visibility", agent.visibility)),
        daily_quota_requests=int(snap.get("daily_quota_requests", agent.daily_quota_requests)),
        current_version=agent.current_version,
        is_active=agent.is_active,
        created_at=agent.created_at,
    )
    saved = await c.agent_repo.save(
        restored,
        author_id=principal.subject_id,
        change_summary=f"Rollback a v{payload.target_version}: {payload.reason}",
    )
    _, egress = await _resolve_agent_egress(c, saved.llm_provider)
    return _serialize_agent(saved, include_internals=True, egress=egress)


@router.delete("/projects/{slug}/agents/{agent_slug}")
async def delete_project_agent(
    slug: str,
    agent_slug: str,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    deleted = await c.agent_repo.delete(slug, agent_slug)
    return {"deleted": deleted, "project_slug": slug, "agent_slug": agent_slug}


# --- Continuous Agent Evaluation Test Suite (Saved Regression Cases) ---
@router.get("/projects/{slug}/agents/{agent_slug}/evals")
async def list_agent_eval_cases(
    slug: str,
    agent_slug: str,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    agent = await c.agent_repo.get_by_slug(slug, agent_slug)
    if agent is None:
        raise DomainException(DomainError.not_found("agent_not_found", f"Agente '{slug}/{agent_slug}' no encontrado."))
    cases = await c.agent_repo.list_eval_cases(agent.agent_id)
    return {
        "agent_id": agent.agent_id,
        "items": [
            {
                "case_id": ev.case_id,
                "question": ev.question,
                "expected_citation_path": ev.expected_citation_path,
                "expected_substring": ev.expected_substring,
                "created_at": ev.created_at.isoformat(),
            }
            for ev in cases
        ],
    }


@router.post("/projects/{slug}/agents/{agent_slug}/evals", status_code=201)
async def create_agent_eval_case(
    slug: str,
    agent_slug: str,
    payload: AgentEvalCasePayload,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    agent = await c.agent_repo.get_by_slug(slug, agent_slug)
    if agent is None:
        raise DomainException(DomainError.not_found("agent_not_found", f"Agente '{slug}/{agent_slug}' no encontrado."))
    ent = AgentEvalCaseEntity(
        case_id=str(uuid.uuid4()),
        agent_id=agent.agent_id,
        project_slug=slug,
        question=payload.question.strip(),
        expected_citation_path=payload.expected_citation_path.strip(),
        expected_substring=payload.expected_substring.strip(),
    )
    saved = await c.agent_repo.save_eval_case(ent)
    return {
        "case_id": saved.case_id,
        "question": saved.question,
        "expected_citation_path": saved.expected_citation_path,
        "expected_substring": saved.expected_substring,
    }


@router.delete("/projects/{slug}/agents/{agent_slug}/evals/{case_id}")
async def delete_agent_eval_case(
    slug: str,
    agent_slug: str,
    case_id: str,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    agent = await c.agent_repo.get_by_slug(slug, agent_slug)
    if agent is None:
        raise DomainException(DomainError.not_found("agent_not_found", f"Agente '{slug}/{agent_slug}' no encontrado."))
    deleted = await c.agent_repo.delete_eval_case(agent.agent_id, case_id)
    return {"deleted": deleted, "case_id": case_id}


@router.post("/projects/{slug}/agents/{agent_slug}/evals/run")
async def run_agent_eval_suite(
    slug: str,
    agent_slug: str,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    agent = await c.agent_repo.get_by_slug(slug, agent_slug)
    if agent is None:
        raise DomainException(DomainError.not_found("agent_not_found", f"Agente '{slug}/{agent_slug}' no encontrado."))
    eval_quota = max(20, agent.daily_quota_requests // 5)
    ev_q = c.rate_limiter.check_daily_quota(f"eval:{slug}/{agent_slug}", eval_quota)
    if ev_q.is_error:
        raise DomainException(ev_q.first_error)
    cases = (await c.agent_repo.list_eval_cases(agent.agent_id))[:50]
    executor = await build_agent_executor(c)
    results: list[dict[str, Any]] = []
    passed_count = 0
    for ev in cases:
        out = await executor.execute(agent=agent, question=ev.question)
        cited_paths = [str(cit.get("path", "")) for cit in out.get("citations", [])]
        cit_ok = (not ev.expected_citation_path) or any(ev.expected_citation_path.lower() in p.lower() for p in cited_paths)
        sub_ok = (not ev.expected_substring) or (ev.expected_substring.lower() in str(out.get("answer", "")).lower())
        ok = bool(out.get("grounded")) and cit_ok and sub_ok
        if ok:
            passed_count += 1
        results.append(
            {
                "case_id": ev.case_id,
                "question": ev.question,
                "passed": ok,
                "grounded": bool(out.get("grounded")),
                "citation_matched": cit_ok,
                "substring_matched": sub_ok,
                "cited_paths": cited_paths,
                "latency_ms": out.get("latency_ms", 0.0),
            }
        )
    total = len(cases)
    return {
        "agent_slug": agent.slug,
        "agent_version": agent.current_version,
        "total": total,
        "passed": passed_count,
        "pass_rate": round((passed_count / total) * 100.0, 1) if total else 100.0,
        "results": results,
    }


@router.post("/projects/{slug}/agents/{agent_slug}/chat")
async def chat_with_project_agent(
    slug: str,
    agent_slug: str,
    payload: AgentChatPayload,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.SEARCH_AND_ASK, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    agent = await c.agent_repo.get_by_slug(slug, agent_slug)
    if agent is None:
        raise DomainException(DomainError.not_found("agent_not_found", f"Agente '{slug}/{agent_slug}' no encontrado."))
    inv = principal.can_invoke_agent(slug, agent_slug, agent.visibility)
    if inv.is_error:
        raise DomainException(inv.first_error)
    # Enforce per-agent & per-key daily quotas (cost & abuse protection)
    ag_q = c.rate_limiter.check_daily_quota(f"agent:{slug}/{agent_slug}", agent.daily_quota_requests)
    if ag_q.is_error:
        raise DomainException(ag_q.first_error)
    if principal.key_id:
        key_q = c.rate_limiter.check_daily_quota(f"key_chat:{principal.key_id}", agent.daily_quota_requests)
        if key_q.is_error:
            raise DomainException(key_q.first_error)
    executor = await build_agent_executor(c)
    raw_res = await executor.execute(
        agent=agent,
        question=payload.question,
        mode=payload.mode,
        ranking=payload.ranking,
        user_id=principal.subject_id,
    )
    return _sanitize_chat_result_for_principal(raw_res, principal)


# --- Safe Origin-Locked, Agent-Scoped Widget Ephemeral Session Token Exchange (BR-18) ---
@router.post("/widget/session")
async def issue_widget_ephemeral_session(
    payload: WidgetSessionPayload,
    request: Request,
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    """Exchanges a read-only publishable key (cf_pub_*) + Origin + public agent check for a scoped ephemeral JWT."""
    key_hash = hashlib.sha256(payload.publishable_key.strip().encode("utf-8")).hexdigest()
    key_ent = await c.api_key_repo.get_by_hash(key_hash)
    if key_ent is None or not key_ent.is_valid:
        raise DomainException(DomainError.unauthorized("invalid_publishable_key", "Clave publicable inválida o revocada."))
    if not key_ent.is_publishable:
        raise DomainException(
            DomainError.forbidden(
                "non_publishable_key_rejected",
                "Por seguridad (BR-18), el widget web solo acepta claves publicables de solo lectura (cf_pub_*), nunca claves privadas.",
            )
        )
    if "*" not in key_ent.allowed_projects and payload.project_slug not in key_ent.allowed_projects:
        raise DomainException(DomainError.forbidden("widget_project_forbidden", f"Clave no autorizada para el proyecto '{payload.project_slug}'."))
    if not key_ent.is_agent_allowed(payload.project_slug, payload.agent_slug):
        raise DomainException(
            DomainError.forbidden(
                "widget_agent_forbidden",
                f"Esta clave publicable no está ligada al agente '{payload.project_slug}/{payload.agent_slug}' (BR-18).",
            )
        )
    origin = request.headers.get("origin") or request.headers.get("referer")
    if origin and origin.startswith(("http://", "https://")):
        parts = origin.split("/")
        origin = "/".join(parts[:3]) if len(parts) >= 3 else origin
    if not key_ent.is_origin_allowed(origin):
        raise DomainException(
            DomainError.forbidden(
                "widget_origin_denied",
                f"Origen '{origin or 'desconocido'}' no está en la allowlist de esta clave publicable (BR-18).",
            )
        )
    agent = await c.agent_repo.get_by_slug(payload.project_slug, payload.agent_slug)
    if agent is None or not agent.is_active:
        raise DomainException(DomainError.not_found("agent_not_found", f"Agente '{payload.project_slug}/{payload.agent_slug}' no encontrado."))
    if agent.visibility != "public":
        raise DomainException(
            DomainError.forbidden(
                "agent_not_public",
                f"El agente '{payload.project_slug}/{payload.agent_slug}' tiene visibility='{agent.visibility}'; solo agentes con visibility='public' pueden usarse en el widget (BR-18).",
            )
        )
    engine_type, _ = await _resolve_agent_egress(c, agent.llm_provider)
    if engine_type == "local_cli":
        raise DomainException(
            DomainError.forbidden(
                "public_agent_cli_forbidden",
                "Los agentes públicos no pueden ejecutarse sobre motores CLI agénticos (BR-17/BR-18).",
            )
        )
    q_chk = c.rate_limiter.check_daily_quota(f"key:{key_ent.key_id}", key_ent.daily_quota_requests)
    if q_chk.is_error:
        raise DomainException(q_chk.first_error)
    await c.api_key_repo.touch_last_used(key_ent.key_id)
    tokens = c.jwt_service.issue_ephemeral_widget_token(
        key_id=key_ent.key_id,
        project_slug=payload.project_slug,
        agent_slug=payload.agent_slug,
    )
    return {
        "session_token": tokens["access_token"],
        "token_type": "bearer",
        "expires_in": tokens.get("expires_in", 900),
        "scope": "widget:chat",
        "project_slug": payload.project_slug,
        "agent_slug": payload.agent_slug,
    }
