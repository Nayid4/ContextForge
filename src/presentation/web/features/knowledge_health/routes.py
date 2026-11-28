"""Knowledge Health Dashboard & Knowledge Gaps Panel Web Routes (/knowledge-health) (0 classes)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import HTMLResponse

from infrastructure.di import DependencyContainer, get_container
from presentation.web.shared.jinja_templates import resolve_active_project_slug, templates

router = APIRouter(tags=["Web: Knowledge Health & Gaps"])


@router.get("/knowledge-health", response_class=HTMLResponse)
async def knowledge_health_view(
    request: Request,
    project: str | None = Query(None),
    c: DependencyContainer = Depends(get_container),
) -> HTMLResponse:
    active_slug = await resolve_active_project_slug(request, c, project)
    return templates.TemplateResponse(
        request=request,
        name="features/knowledge_health/views/knowledge_health.html",
        context={"active_slug": active_slug},
    )
