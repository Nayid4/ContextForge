"""External Integration Guide & MCP Documentation Web Route (0 classes)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import HTMLResponse

from infrastructure.di import DependencyContainer, get_container
from presentation.web.shared.jinja_templates import resolve_active_project_slug, templates

router = APIRouter(tags=["Web: Integrations Guide"])


@router.get("/docs/integration-guide", response_class=HTMLResponse)
async def integration_guide_view(
    request: Request,
    project: str | None = Query(None),
    c: DependencyContainer = Depends(get_container),
) -> HTMLResponse:
    active_slug = await resolve_active_project_slug(request, c, project)
    base_url = str(request.base_url).rstrip("/")
    projects = await c.project_repo.list_projects()
    agents = await c.agent_repo.list_all()
    agents_data = [
        {
            "project_slug": a.project_slug,
            "slug": a.slug,
            "name": a.name,
            "visibility": a.visibility,
            "openai_model_id": a.openai_model_id,
        }
        for a in agents
        if a.is_active
    ]
    return templates.TemplateResponse(
        request=request,
        name="features/integrations/views/integration_guide.html",
        context={
            "active_slug": active_slug,
            "base_url": base_url,
            "auth_mode": c.settings.env.auth_mode,
            "projects": [{"slug": p.slug, "name": p.name} for p in projects],
            "agents": agents_data,
        },
    )
