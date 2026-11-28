"""Projects Management & Navbar HTMX Selector Web Routes (0 classes)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Form, Query, Request
from fastapi.responses import HTMLResponse, RedirectResponse

from application.projects.commands.CreateProject import CreateProjectCommand
from application.projects.commands.SwitchActiveProject import SwitchActiveProjectCommand
from domain.common import PageParams
from infrastructure.di import DependencyContainer, get_container
from presentation.web.shared.jinja_templates import resolve_active_project_slug, templates

router = APIRouter(tags=["Web: Projects"])


@router.get("/projects", response_class=HTMLResponse)
async def projects_list_view(
    request: Request,
    q: str = Query(""),
    page: int = Query(1, ge=1),
    per_page: int = Query(6, ge=1, le=24),
    c: DependencyContainer = Depends(get_container),
) -> HTMLResponse:
    active_slug = await resolve_active_project_slug(request, c)
    paged = await c.project_repo.list_paginated(
        search=q.strip() or None,
        pagination=PageParams(page=page, page_size=per_page),
    )

    enriched = []
    for p in paged.items:
        docs = await c.doc_repo.list_all(project_slug=p.slug)
        mods = sorted({d.module_name for d in docs if d.module_name})
        enriched.append({"entity": p, "is_current": p.slug == active_slug, "doc_count": len(docs), "modules": mods})

    return templates.TemplateResponse(
        request=request,
        name="features/projects/views/projects_list.html",
        context={
            "projects": enriched,
            "total_projects": paged.total_count,
            "current_page": paged.page,
            "total_pages": paged.total_pages,
            "per_page": paged.page_size,
            "has_prev": paged.has_prev,
            "has_next": paged.has_next,
            "search_query": q,
        },
    )


@router.get("/ui/projects/navbar-selector", response_class=HTMLResponse)
async def navbar_project_selector(request: Request, c: DependencyContainer = Depends(get_container)) -> HTMLResponse:
    active_slug = await resolve_active_project_slug(request, c)
    projects = await c.project_repo.list_projects()
    return templates.TemplateResponse(
        request=request,
        name="features/projects/components/navbar_project_selector.html",
        context={"projects": projects, "active_project": active_slug},
    )


@router.post("/ui/projects/switch")
async def switch_active_project_web(
    request: Request,
    project_slug: str = Form(...),
    c: DependencyContainer = Depends(get_container),
) -> RedirectResponse:
    await c.mediator.send(SwitchActiveProjectCommand(project_slug=project_slug))
    referer = request.headers.get("referer") or "/docs/browser"
    resp = RedirectResponse(url=referer, status_code=303)
    resp.set_cookie("cf_active_project", project_slug, httponly=False, samesite="lax")
    return resp


@router.post("/projects/new")
async def create_project_web(
    name: str = Form(...),
    slug: str = Form(""),
    description: str = Form(""),
    sovereign_only: bool = Form(False),
    make_active: bool = Form(True),
    c: DependencyContainer = Depends(get_container),
) -> RedirectResponse:
    eff_slug = (slug or name).strip().lower().replace(" ", "-")
    res = await c.mediator.send(
        CreateProjectCommand(
            name=name,
            slug=eff_slug,
            path=f"./docs/{eff_slug}",
            description=description,
            sovereign_only=sovereign_only,
        )
    )
    resp = RedirectResponse(url="/projects", status_code=303)
    if not res.is_error and make_active:
        await c.mediator.send(SwitchActiveProjectCommand(project_slug=res.value.slug))
        resp.set_cookie("cf_active_project", res.value.slug, httponly=False, samesite="lax")
    return resp
