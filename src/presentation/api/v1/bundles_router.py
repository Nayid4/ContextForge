"""Context Bundles & Agent CLI Rules Sync REST v1 Router with real DB pagination (0 classes)."""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends, Query, Request, Response

from application.bundles.commands.CompileContextBundle import CompileContextBundleCommand
from application.bundles.commands.ExportAgentRules import ExportAgentRulesCommand
from application.bundles.queries.GetContextBundleById import GetContextBundleByIdQuery
from domain.common import DomainException, PageParams
from domain.users import AuthPrincipal, PermissionAction
from infrastructure.di import DependencyContainer, get_container
from presentation.api.dependencies import build_cqrs_context, require_permission
from presentation.api.v1.schemas import CompileBundlePayload, ExportAgentRulesPayload

router = APIRouter(prefix="/bundles", tags=["Context Bundles & Manifests (BND)"])


@router.post("/compile", status_code=201)
async def compile_bundle(
    payload: CompileBundlePayload,
    request: Request,
    response: Response,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.COMPILE_BUNDLE)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    chk = principal.can_perform(PermissionAction.COMPILE_BUNDLE, project_slug=payload.project_slug)
    if chk.is_error:
        raise DomainException(chk.first_error)
    bundle = await c.mediator.execute_or_raise(
        CompileContextBundleCommand(
            name=payload.name,
            project_slug=payload.project_slug,
            document_paths=tuple(payload.document_paths),
            query=payload.query,
            max_tokens=payload.max_tokens,
            export_format=payload.export_format,
            created_by=principal.display_name,
        ),
        context=build_cqrs_context(request, principal, payload.project_slug),
    )
    response.headers["X-Bundle-SHA256"] = bundle.bundle_hash
    return {
        "bundle_id": bundle.bundle_id,
        "name": bundle.name,
        "project_slug": bundle.project_slug,
        "export_format": bundle.export_format,
        "max_tokens": bundle.max_tokens,
        "estimated_tokens": bundle.estimated_tokens,
        "bundle_hash": bundle.bundle_hash,
        "included_paths": list(bundle.included_paths),
        "omitted_paths": list(bundle.omitted_paths),
        "content": bundle.content,
    }


@router.post("/export-agent-rules")
async def export_agent_rules(
    payload: ExportAgentRulesPayload,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.COMPILE_BUNDLE)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    files = await c.mediator.execute_or_raise(
        ExportAgentRulesCommand(
            project_slug=payload.project_slug,
            targets=tuple(payload.targets),
            selected_modules=tuple(payload.selected_modules),
            write_to_project_root=payload.write_to_project_root,
        ),
        context=build_cqrs_context(request, principal, payload.project_slug),
    )
    return {"status": "synced", "project_slug": payload.project_slug, "files": files}


@router.get("")
async def list_bundles(
    project: str = Query("default"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE, project_param="project")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    paged = await c.bundle_repo.list_paginated(project_slug=project, pagination=PageParams(page=page, page_size=page_size))
    return {
        "items": [
            {
                "bundle_id": b.bundle_id,
                "name": b.name,
                "export_format": b.export_format,
                "estimated_tokens": b.estimated_tokens,
                "max_tokens": b.max_tokens,
                "bundle_hash": b.bundle_hash,
                "included_count": len(b.included_paths),
                "omitted_count": len(b.omitted_paths),
                "created_at": b.created_at.isoformat(),
            }
            for b in paged.items
        ],
        "page": paged.page,
        "page_size": paged.page_size,
        "total_count": paged.total_count,
        "total_pages": paged.total_pages,
        "has_prev": paged.has_prev,
        "has_next": paged.has_next,
    }


@router.get("/{bundle_id}/export")
async def export_bundle_file(
    bundle_id: str,
    project: str | None = Query(None),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.COMPILE_BUNDLE)),
    c: DependencyContainer = Depends(get_container),
) -> Response:
    b = await c.mediator.execute_or_raise(GetContextBundleByIdQuery(bundle_id=bundle_id, project_slug=project))
    mime = {
        "markdown": "text/markdown; charset=utf-8",
        "cursorrules": "text/plain; charset=utf-8",
        "json": "application/json; charset=utf-8",
        "xml": "application/xml; charset=utf-8",
    }.get(b.export_format, "text/plain")
    ext = {"markdown": "md", "cursorrules": "cursorrules", "json": "json", "xml": "xml"}.get(b.export_format, "txt")
    return Response(
        content=b.content,
        media_type=mime,
        headers={
            "Content-Disposition": f'attachment; filename="{b.name.lower().replace(" ", "_")}.{ext}"',
            "X-Bundle-SHA256": b.bundle_hash,
        },
    )
