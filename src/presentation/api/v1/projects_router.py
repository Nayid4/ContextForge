"""Projects & Taxonomy REST v1 Router with real DB pagination (0 classes)."""

from __future__ import annotations

from dataclasses import asdict
from typing import Any
from fastapi import APIRouter, Depends, Query, Request

from application.projects.commands.CreateProject import CreateProjectCommand
from application.projects.commands.SaveTaxonomyItem import SaveTaxonomyItemCommand
from application.projects.commands.SwitchActiveProject import SwitchActiveProjectCommand
from application.projects.commands.SyncFilesystemDocs import SyncFilesystemDocsCommand
from application.projects.queries.ListTaxonomyItems import ListTaxonomyItemsQuery
from domain.common import PageParams
from domain.users import AuthPrincipal, PermissionAction
from infrastructure.di import DependencyContainer, get_container
from presentation.api.dependencies import build_cqrs_context, require_permission
from presentation.api.v1.schemas import CreateProjectPayload, TaxonomyPayload

router = APIRouter(prefix="/projects", tags=["Projects & Taxonomy (PRJ)"])


@router.get("")
async def list_projects(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    paged = await c.project_repo.list_paginated(
        search=search,
        allowed_slugs=principal.allowed_projects,
        pagination=PageParams(page=page, page_size=page_size),
    )
    return {
        "items": [
            {
                "slug": p.slug,
                "name": p.name,
                "description": p.description,
                "path": p.path,
                "sovereign_only": p.sovereign_only,
                "max_quota_mb": p.max_quota_mb,
                "is_active": p.is_active,
            }
            for p in paged.items
        ],
        "page": paged.page,
        "page_size": paged.page_size,
        "total_count": paged.total_count,
        "total_pages": paged.total_pages,
        "has_prev": paged.has_prev,
        "has_next": paged.has_next,
    }


@router.post("", status_code=201)
async def create_project(
    payload: CreateProjectPayload,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.MANAGE_PROJECTS)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    proj = await c.mediator.execute_or_raise(
        CreateProjectCommand(
            name=payload.name,
            slug=payload.slug,
            path=payload.path,
            description=payload.description,
            sovereign_only=payload.sovereign_only,
            max_quota_mb=payload.max_quota_mb,
            owner_id=principal.subject_id,
        ),
        context=build_cqrs_context(request, principal, payload.slug or "default"),
    )
    return {"slug": proj.slug, "name": proj.name, "path": proj.path, "sovereign_only": proj.sovereign_only}


@router.post("/{slug}/activate")
async def activate_project(
    slug: str,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    proj = await c.mediator.execute_or_raise(SwitchActiveProjectCommand(project_slug=slug), context=build_cqrs_context(request, principal, slug))
    return {"active_project": proj.slug, "sovereign_only": proj.sovereign_only}


@router.post("/{slug}/sync")
async def sync_project_docs(
    slug: str,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    summary = await c.mediator.execute_or_raise(SyncFilesystemDocsCommand(project_slug=slug), context=build_cqrs_context(request, principal, slug))
    return asdict(summary)


@router.get("/{slug}/taxonomy")
async def list_taxonomy(
    slug: str,
    kind: str | None = Query(None),
    search: str | None = Query(None),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    items = await c.mediator.execute_or_raise(ListTaxonomyItemsQuery(project_slug=slug, kind=kind, search=search))
    return {
        "items": [
            {"id": i.id, "slug": i.slug, "kind": i.kind.value, "name": i.name, "description": i.description, "color": i.color}
            for i in items
        ]
    }


@router.post("/{slug}/taxonomy", status_code=201)
async def create_taxonomy(
    slug: str,
    payload: TaxonomyPayload,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT, project_param="slug")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    item = await c.mediator.execute_or_raise(
        SaveTaxonomyItemCommand(
            project_slug=slug,
            kind=payload.kind,
            name=payload.name,
            slug=payload.slug,
            description=payload.description,
            color=payload.color,
        ),
        context=build_cqrs_context(request, principal, slug),
    )
    return {"id": item.id, "slug": item.slug, "kind": item.kind.value, "name": item.name, "color": item.color}
