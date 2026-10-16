"""Taxonomy REST API Endpoints for Global & Project Modules and Tags."""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field
from domain.taxonomy.entities import ModuleEntity, TagEntity
from domain.taxonomy.repositories import ITaxonomyRepository
from presentation.api.dependencies import get_taxonomy_repo

router = APIRouter(prefix="/taxonomy", tags=["Taxonomy"])


class CreateModuleRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str | None = None
    description: str = ""
    icon: str = "fa-folder"
    color: str = "indigo"
    project_slug: str | None = None


class CreateTagRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    slug: str | None = None
    color: str = "blue"
    project_slug: str | None = None


@router.get("/modules")
async def list_modules_api(
    project: str | None = Query(None, description="Optional project filter"),
    q: str | None = Query(None, description="Search keyword"),
    repo: ITaxonomyRepository = Depends(get_taxonomy_repo),
) -> list[dict[str, Any]]:
    """List available modules/categories (both global and project-specific)."""
    modules = await repo.list_modules(project_slug=project, search=q)
    return [
        {
            "id": m.id,
            "slug": m.slug,
            "name": m.name,
            "description": m.description,
            "icon": m.icon,
            "color": m.color,
            "project_slug": m.project_slug,
        }
        for m in modules
    ]


@router.post("/modules", status_code=status.HTTP_201_CREATED)
async def create_module_api(
    req: CreateModuleRequest,
    repo: ITaxonomyRepository = Depends(get_taxonomy_repo),
) -> dict[str, Any]:
    """Create a new documentation module or category."""
    entity = ModuleEntity.create(
        name=req.name,
        slug=req.slug,
        description=req.description,
        icon=req.icon,
        color=req.color,
        project_slug=req.project_slug,
    )
    saved = await repo.save_module(entity)
    return {
        "id": saved.id,
        "slug": saved.slug,
        "name": saved.name,
        "description": saved.description,
        "icon": saved.icon,
        "color": saved.color,
        "project_slug": saved.project_slug,
    }


@router.get("/tags")
async def list_tags_api(
    project: str | None = Query(None, description="Optional project filter"),
    q: str | None = Query(None, description="Search keyword"),
    repo: ITaxonomyRepository = Depends(get_taxonomy_repo),
) -> list[dict[str, Any]]:
    """List available tags (both global and project-specific)."""
    tags = await repo.list_tags(project_slug=project, search=q)
    return [
        {
            "id": t.id,
            "slug": t.slug,
            "name": t.name,
            "color": t.color,
            "project_slug": t.project_slug,
        }
        for t in tags
    ]


@router.post("/tags", status_code=status.HTTP_201_CREATED)
async def create_tag_api(
    req: CreateTagRequest,
    repo: ITaxonomyRepository = Depends(get_taxonomy_repo),
) -> dict[str, Any]:
    """Create a new documentation tag."""
    entity = TagEntity.create(
        name=req.name,
        slug=req.slug,
        color=req.color,
        project_slug=req.project_slug,
    )
    saved = await repo.save_tag(entity)
    return {
        "id": saved.id,
        "slug": saved.slug,
        "name": saved.name,
        "color": saved.color,
        "project_slug": saved.project_slug,
    }
