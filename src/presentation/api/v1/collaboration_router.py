"""Realtime Collaboration & Immutable Audit Logs REST v1 Router (0 classes)."""

from __future__ import annotations

from dataclasses import asdict
from typing import Any
from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import JSONResponse

from application.collaboration.commands.PostDocumentComment import PostDocumentCommentCommand
from application.collaboration.commands.RateDocument import RateDocumentCommand
from application.collaboration.commands.ResolveCommentThread import ResolveCommentThreadCommand
from application.collaboration.queries.ListAuditLogs import ListAuditLogsQuery
from domain.common import DomainError, DomainException, PageParams
from domain.users import AuthPrincipal, PermissionAction, UserRole
from infrastructure.di import DependencyContainer, get_container
from presentation.api.dependencies import build_cqrs_context, require_permission
from presentation.api.v1.schemas import CommentPayload, RatingPayload, ResolvePayload

router = APIRouter(tags=["Realtime Collaboration & Immutable Audit (COL)"])


@router.get("/collaboration/threads")
async def list_threads(
    doc_path: str = Query(...),
    project: str = Query("default"),
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE, project_param="project")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    doc = await c.doc_repo.get_by_path(doc_path, project_slug=project)
    if doc is None:
        return {
            "page": page,
            "page_size": page_size,
            "total_count": 0,
            "total_pages": 1,
            "has_prev": False,
            "has_next": False,
            "threads": [],
            "items": [],
        }
    paged = await c.collab_repo.list_threads_paginated(
        doc.id,
        project,
        pagination=PageParams(page=page, page_size=page_size),
    )
    serialized = [
        {
            "id": t.id,
            "title": t.title,
            "section_anchor": t.section_anchor,
            "resolved": t.resolved,
            "comments": [
                {
                    "id": cm.id,
                    "author_id": cm.author_id,
                    "author_name": cm.author_name,
                    "content": cm.content,
                    "created_at": cm.created_at.isoformat(),
                }
                for cm in t.comments
            ],
        }
        for t in paged.items
    ]
    return {
        "page": paged.page,
        "page_size": paged.page_size,
        "total_count": paged.total_count,
        "total_pages": paged.total_pages,
        "has_prev": paged.has_prev,
        "has_next": paged.has_next,
        "threads": serialized,
        "items": serialized,
    }


@router.post("/collaboration/threads", status_code=201)
async def post_comment(
    payload: CommentPayload,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.COLLABORATE)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    t = await c.mediator.execute_or_raise(
        PostDocumentCommentCommand(
            doc_path=payload.doc_path,
            project_slug=payload.project_slug,
            author_id=principal.subject_id,
            author_name=principal.display_name,
            author_email=principal.email,
            content=payload.content,
            thread_id=payload.thread_id,
            title=payload.title,
            section_anchor=payload.section_anchor,
        ),
        context=build_cqrs_context(request, principal, payload.project_slug),
    )
    return {
        "thread_id": t.id,
        "resolved": t.resolved,
        "comments_count": len(t.comments),
        "last_comment_id": t.comments[-1].id if t.comments else None,
        "author_id": principal.subject_id,
    }


@router.delete("/collaboration/comments/{comment_id}")
async def delete_comment(
    comment_id: str,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.COLLABORATE)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    """Only the comment's original author_id or an Admin may delete a comment."""
    comment = await c.collab_repo.get_comment(comment_id)
    if comment is None:
        raise DomainException(DomainError.not_found("comment_not_found", f"Comentario '{comment_id}' no encontrado."))
    if principal.role != UserRole.ADMIN and comment.author_id != principal.subject_id:
        raise DomainException(
            DomainError.forbidden(
                "comment_delete_forbidden",
                "Solo el autor del comentario o un Admin pueden eliminarlo.",
            )
        )
    deleted = await c.collab_repo.delete_comment(comment_id)
    return {"deleted": deleted, "comment_id": comment_id}


@router.patch("/collaboration/threads/{thread_id}/resolve")
async def resolve_thread(
    thread_id: str,
    payload: ResolvePayload,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.COLLABORATE)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    t = await c.mediator.execute_or_raise(
        ResolveCommentThreadCommand(thread_id=thread_id, resolved=payload.resolved, project_slug=payload.project_slug),
        context=build_cqrs_context(request, principal, payload.project_slug),
    )
    return {"thread_id": t.id, "resolved": t.resolved}


@router.post("/collaboration/ratings")
async def rate_document(
    payload: RatingPayload,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.COLLABORATE)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    summary = await c.mediator.execute_or_raise(
        RateDocumentCommand(
            doc_path=payload.doc_path,
            project_slug=payload.project_slug,
            user_identifier=principal.subject_id,
            score=payload.score,
        ),
        context=build_cqrs_context(request, principal, payload.project_slug),
    )
    return asdict(summary)


@router.get("/audit-logs")
async def list_audit_logs(
    project: str | None = Query(None),
    operation: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_AUDIT_LOGS)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    paged, chain_valid = await c.mediator.execute_or_raise(
        ListAuditLogsQuery(project_slug=project, operation=operation, page=page, page_size=page_size)
    )
    return {
        "chain_integrity_valid": chain_valid,
        "page": paged.page,
        "page_size": paged.page_size,
        "total_count": paged.total_count,
        "total_pages": paged.total_pages,
        "items": [
            {
                "log_id": r.log_id,
                "actor_id": r.actor_id,
                "role": r.role,
                "project_slug": r.project_slug,
                "operation": r.operation,
                "resource_id": r.resource_id,
                "succeeded": r.succeeded,
                "latency_ms": r.latency_ms,
                "entry_hash": r.entry_hash,
                "prev_hash": r.prev_hash,
                "error_code": r.error_code,
                "created_at": r.created_at.isoformat(),
            }
            for r in paged.items
        ],
    }


@router.get("/audit-logs/verify")
async def verify_audit_chain(
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_AUDIT_LOGS)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    """Cryptographically verifies the entire SHA-256 hash chain in audit_logs (BR-14)."""
    return await c.event_store.verify_chain_detailed()


@router.delete("/audit-logs/{log_id}")
@router.put("/audit-logs/{log_id}")
async def forbid_audit_mutation(log_id: str, request: Request) -> JSONResponse:
    """BR-14: Append-only audit logs cannot be edited or deleted even by Admin."""
    return JSONResponse(
        status_code=405,
        media_type="application/problem+json",
        content={
            "type": "https://contextforge.local/errors/immutable-audit-log",
            "title": "Method Not Allowed",
            "status": 405,
            "detail": "La bitácora de auditoría es estrictamente append-only e inmutable (BR-14).",
            "instance": str(request.url.path),
        },
    )
