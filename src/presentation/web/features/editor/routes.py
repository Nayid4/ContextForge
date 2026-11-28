"""Dual Mode Editor Web Routes (0 classes)."""

from __future__ import annotations

import re
from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import HTMLResponse

from domain.projects import TaxonomyKind
from infrastructure.di import DependencyContainer, get_container
from presentation.web.shared.jinja_templates import resolve_active_project_slug, templates

router = APIRouter(tags=["Web: Dual Editor"])


@router.get("/books/editor", response_class=HTMLResponse)
@router.get("/docs/new", response_class=HTMLResponse)
async def dual_editor_view(
    request: Request,
    path: str | None = Query(None),
    project: str | None = Query(None),
    from_gap: str | None = Query(None),
    c: DependencyContainer = Depends(get_container),
) -> HTMLResponse:
    active_project = await resolve_active_project_slug(request, c, project)
    existing_doc = await c.doc_repo.get_by_path(path, project_slug=active_project) if path else None
    gap_prefill: dict[str, str] | None = None
    if existing_doc is None and from_gap:
        gap = await c.feedback_repo.get_gap(from_gap)
        if gap is not None:
            clean_title = gap.topic_cluster.replace("-", " ").title() if gap.topic_cluster != "general" else "Guía de Referencia"
            slug_part = re.sub(r"[^a-z0-9_-]+", "_", gap.topic_cluster.lower()).strip("_") or "guia"
            gap_prefill = {
                "gap_id": gap.gap_id,
                "path": f"{gap.suggested_module}/{slug_part}.md",
                "title": clean_title,
                "module": gap.suggested_module or "general",
                "summary": f"Documentación creada para cerrar vacío documental: {gap.question[:140]}",
                "markdown": (
                    f"# {clean_title}\n\n"
                    f"## Debe responder\n"
                    f"- {gap.question}\n\n"
                    f"## Solución y Reglas Verificadas\n"
                    f"_Describe aquí las reglas, pasos o decisiones oficiales del proyecto._\n"
                ),
            }
    projects = await c.project_repo.list_projects()
    modules = await c.project_repo.list_taxonomy(active_project, kind=TaxonomyKind.MODULE)
    tags = await c.project_repo.list_taxonomy(active_project, kind=TaxonomyKind.TAG)
    return templates.TemplateResponse(
        request=request,
        name="features/editor/views/editor.html",
        context={
            "active_project": active_project,
            "existing_doc": existing_doc,
            "gap_prefill": gap_prefill,
            "projects": projects,
            "available_modules": modules,
            "available_tags": tags,
        },
    )
