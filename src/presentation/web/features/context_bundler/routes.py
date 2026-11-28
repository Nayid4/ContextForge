"""Context Bundler & Agent CLI Sync Web Routes (0 classes)."""

from __future__ import annotations

from collections import defaultdict
from fastapi import APIRouter, Depends, Form, Query, Request, Response
from fastapi.responses import HTMLResponse

from application.bundles.commands.CompileContextBundle import CompileContextBundleCommand
from application.bundles.queries.GetContextBundleById import GetContextBundleByIdQuery
from domain.common import PageParams
from infrastructure.di import DependencyContainer, get_container
from presentation.web.shared.jinja_templates import resolve_active_project_slug, templates

router = APIRouter(tags=["Web: Context Bundler"])


async def _build_bundler_context(
    c: DependencyContainer,
    active_project: str,
    selected_modules: list[str] | None = None,
    max_tokens: int = 16000,
    export_format: str = "markdown",
    compiled_bundle: object | None = None,
    success_message: str = "",
    page: int = 1,
    per_page: int = 5,
) -> dict[str, object]:
    projects = await c.project_repo.list_projects()
    docs = await c.doc_repo.list_all(project_slug=active_project, only_published=True)
    paged_bundles = await c.bundle_repo.list_paginated(
        project_slug=active_project,
        pagination=PageParams(page=page, page_size=per_page),
    )
    tree: dict[str, list[object]] = defaultdict(list)
    for d in docs:
        tree[d.module_name or "general"].append(d)
    eff_selected = selected_modules if selected_modules is not None else list(tree.keys())
    return {
        "active_project": active_project,
        "projects": projects,
        "tree": dict(tree),
        "selected_modules": eff_selected,
        "max_tokens": max_tokens,
        "export_format": export_format,
        "compiled_bundle": compiled_bundle,
        "success_message": success_message,
        "saved_bundles": paged_bundles.items,
        "bundles_page": paged_bundles.page,
        "bundles_total_pages": paged_bundles.total_pages,
        "bundles_total": paged_bundles.total_count,
        "bundles_per_page": paged_bundles.page_size,
        "bundles_has_prev": paged_bundles.has_prev,
        "bundles_has_next": paged_bundles.has_next,
    }


@router.get("/bundles", response_class=HTMLResponse)
async def bundler_view(
    request: Request,
    project: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(5, ge=1, le=50),
    c: DependencyContainer = Depends(get_container),
) -> HTMLResponse:
    active_project = await resolve_active_project_slug(request, c, project)
    ctx = await _build_bundler_context(c, active_project, page=page, per_page=per_page)
    return templates.TemplateResponse(request=request, name="features/context_bundler/views/bundler.html", context=ctx)


@router.post("/bundles/compile", response_class=HTMLResponse)
async def compile_bundle_web(
    request: Request,
    project_slug: str = Form("default"),
    modules: list[str] = Form(default=[]),
    max_tokens: int = Form(16000),
    export_format: str = Form("markdown"),
    c: DependencyContainer = Depends(get_container),
) -> HTMLResponse:
    docs = await c.doc_repo.list_all(project_slug=project_slug, only_published=True)
    if modules:
        allowed = set(modules)
        doc_paths = tuple(d.path for d in docs if (d.module_name or "general") in allowed)
    else:
        doc_paths = tuple(d.path for d in docs)

    res = await c.mediator.send(
        CompileContextBundleCommand(
            name=f"Bundle {project_slug}",
            project_slug=project_slug,
            document_paths=doc_paths,
            max_tokens=max_tokens,
            export_format=export_format,
        )
    )
    bundle = res.value if not res.is_error else None
    msg = f"Context Bundle compilado ({bundle.estimated_tokens} tokens, SHA-256: {bundle.bundle_hash[:12]})." if bundle else res.first_error.message
    ctx = await _build_bundler_context(
        c,
        project_slug,
        selected_modules=modules,
        max_tokens=max_tokens,
        export_format=export_format,
        compiled_bundle=bundle,
        success_message=msg,
    )
    return templates.TemplateResponse(request=request, name="features/context_bundler/views/bundler.html", context=ctx)


@router.get("/bundles/{bundle_id}/download")
async def download_bundle_web(bundle_id: str, c: DependencyContainer = Depends(get_container)) -> Response:
    b = await c.mediator.execute_or_raise(GetContextBundleByIdQuery(bundle_id=bundle_id))
    ext = {"cursorrules": "cursorrules", "json": "json", "xml": "xml"}.get(b.export_format, "md")
    return Response(
        content=b.content,
        media_type="text/markdown; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="context_bundle.{ext}"', "X-Bundle-SHA256": b.bundle_hash},
    )
