"""Projects Web Presentation Routes (Screaming Architecture)."""

from __future__ import annotations

from pathlib import Path
from typing import Any
from fastapi import APIRouter, Cookie, Depends, Form, Header, Request, status
from fastapi.responses import HTMLResponse, RedirectResponse, Response
from fastapi.templating import Jinja2Templates
from core.domain.project import IProjectRepository, Project
from core.use_cases.ingest_docs import IngestDocsUseCase
from domain.knowledge_docs.repositories import IDocumentRepository
from presentation.api.dependencies import (
    get_doc_repo,
    get_ingest_docs_use_case,
    get_project_repo,
)

TEMPLATES_DIR = Path(__file__).resolve().parent.parent.parent
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

router = APIRouter(tags=["Frontend: Projects"])


@router.get("/projects", response_class=HTMLResponse)
async def list_projects_view(
    request: Request,
    project_repo: IProjectRepository = Depends(get_project_repo),
    doc_repo: IDocumentRepository = Depends(get_doc_repo),
    cf_active_project: str | None = Cookie(default=None),
) -> HTMLResponse:
    """Projects management dashboard showing all registered multi-project repositories."""
    projects = await project_repo.list_all()
    active_slug = cf_active_project or "default"

    # Gather stats for each project
    project_cards: list[dict[str, Any]] = []
    for p in projects:
        docs = await doc_repo.list_all(project_slug=p.slug.value)
        modules = sorted(list({d.module for d in docs if d.module}))
        project_cards.append({
            "entity": p,
            "doc_count": len(docs),
            "modules": modules,
            "is_current": (p.slug.value == active_slug or (p.is_active and not cf_active_project)),
        })

    return templates.TemplateResponse(
        request=request,
        name="modules/projects/views/projects_list.html",
        context={
            "projects": project_cards,
            "active_slug": active_slug,
        },
    )


@router.post("/projects/new", response_class=HTMLResponse)
async def create_project_view(
    request: Request,
    name: str = Form(...),
    description: str = Form(""),
    slug: str = Form(""),
    make_active: bool = Form(True),
    project_repo: IProjectRepository = Depends(get_project_repo),
    ingest_use_case: IngestDocsUseCase = Depends(get_ingest_docs_use_case),
) -> Any:
    """Create a new project workspace and initialize docs folder structure."""
    clean_name = name.strip()
    clean_slug = slug.strip().lower() or None

    project = Project.create(
        name=clean_name,
        slug=clean_slug,
        description=description.strip(),
        is_active=make_active,
    )

    await project_repo.save(project)

    # Auto-seed a README.md for the new project
    proj_dir = Path(project.path)
    proj_dir.mkdir(parents=True, exist_ok=True)
    readme_path = proj_dir / "README.md"
    if not readme_path.exists():
        readme_content = f"""# {project.name}

{project.description or "Documentación técnica y arquitectura de " + project.name}

## 1. Módulos y Arquitectura
- `architecture`: Decisiones de diseño y ADRs.
- `api`: Integraciones y contratos OpenAPI.
- `troubleshooting`: Guías operativas y runbooks.
"""
        with open(readme_path, mode="w", encoding="utf-8") as f:
            f.write(readme_content)

    # Ingest the new project
    await ingest_use_case.execute(project_slug=project.slug.value)

    if make_active:
        await project_repo.set_active(project.slug.value)

    response = RedirectResponse(url="/projects", status_code=status.HTTP_302_FOUND)
    if make_active:
        response.set_cookie(key="cf_active_project", value=project.slug.value, max_age=86400 * 30)
    return response


@router.post("/ui/projects/switch")
async def switch_project_action(
    request: Request,
    project_slug: str = Form(...),
    project_repo: IProjectRepository = Depends(get_project_repo),
    referer: str | None = Header(default=None),
) -> Response:
    """Switch active project globally, updating session/cookie and notifying HTMX."""
    clean_slug = project_slug.strip().lower()
    await project_repo.set_active(clean_slug)

    target_url = referer or "/docs/browser"
    is_htmx = request.headers.get("HX-Request") == "true"

    if is_htmx:
        resp = Response(status_code=status.HTTP_200_OK)
        resp.headers["HX-Refresh"] = "true"
        resp.set_cookie(key="cf_active_project", value=clean_slug, max_age=86400 * 30, path="/")
        return resp

    redirect_resp = RedirectResponse(url=target_url, status_code=status.HTTP_303_SEE_OTHER)
    redirect_resp.set_cookie(key="cf_active_project", value=clean_slug, max_age=86400 * 30, path="/")
    return redirect_resp


@router.get("/ui/projects/navbar-selector", response_class=HTMLResponse)
async def navbar_selector_fragment(
    request: Request,
    project_repo: IProjectRepository = Depends(get_project_repo),
    cf_active_project: str | None = Cookie(default=None),
) -> HTMLResponse:
    """HTMX fragment returning the project select dropdown for the Navbar."""
    projects = await project_repo.list_all()
    active_slug = cf_active_project or (projects[0].slug.value if projects else "default")

    return templates.TemplateResponse(
        request=request,
        name="modules/projects/views/navbar_selector.html",
        context={
            "projects": projects,
            "active_slug": active_slug,
        },
    )

