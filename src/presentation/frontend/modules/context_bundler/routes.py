"""Context Bundler Web Presentation Routes."""

from __future__ import annotations

from pathlib import Path
from typing import Any
from fastapi import APIRouter, Cookie, Depends, Form, Request
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from core.domain.project import IProjectRepository
from domain.knowledge_docs.entities import Document
from domain.knowledge_docs.repositories import IDocumentRepository
from domain.shared_kernel.exceptions import EntityNotFoundException
from application.context_builder.commands import BuildContextBundleCommand
from application.context_builder.handlers import BuildContextBundleCommandHandler
from presentation.api.dependencies import (
    get_bundle_handler,
    get_bundle_repo,
    get_doc_repo,
    get_project_repo,
)

TEMPLATES_DIR = Path(__file__).resolve().parent.parent.parent
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

router = APIRouter(prefix="/bundles", tags=["Frontend: Context Bundler"])


@router.get("", response_class=HTMLResponse)
async def bundler_view(
    request: Request,
    project: str | None = None,
    cf_active_project: str | None = Cookie(default=None),
    project_repo: IProjectRepository = Depends(get_project_repo),
    doc_repo: IDocumentRepository = Depends(get_doc_repo),
    bundle_repo: Any = Depends(get_bundle_repo),
) -> HTMLResponse:
    """Render Context Bundler interface with hierarchical project and module tree."""
    projects = await project_repo.list_all()
    active_slug = project or cf_active_project or (projects[0].slug.value if projects else "default")

    docs = await doc_repo.list_all(project_slug=active_slug)
    tree: dict[str, list[Document]] = {}
    for d in docs:
        mod = d.module or "general"
        if mod not in tree:
            tree[mod] = []
        tree[mod].append(d)

    available_modules = sorted(list(tree.keys()))
    existing_bundles = await bundle_repo.list_bundles()

    return templates.TemplateResponse(
        request=request,
        name="modules/context_bundler/views/bundler.html",
        context={
            "projects": projects,
            "active_project": active_slug,
            "tree": tree,
            "available_modules": available_modules,
            "existing_bundles": existing_bundles,
            "compiled_bundle": None,
            "selected_modules": available_modules,
            "max_tokens": 16000,
            "export_format": "markdown",
        },
    )


@router.post("/compile", response_class=HTMLResponse)
async def compile_bundle_view(
    request: Request,
    modules: list[str] = Form(default_factory=list),
    project_slug: str = Form("default"),
    export_format: str = Form("markdown"),
    max_tokens: int = Form(16000),
    include_toc: bool = Form(True),
    include_guidelines: bool = Form(True),
    handler: BuildContextBundleCommandHandler = Depends(get_bundle_handler),
    project_repo: IProjectRepository = Depends(get_project_repo),
    doc_repo: IDocumentRepository = Depends(get_doc_repo),
    bundle_repo: Any = Depends(get_bundle_repo),
) -> HTMLResponse:
    """Compile selected documentation into an optimized AI Context Bundle (.md or .cursorrules)."""
    command = BuildContextBundleCommand(
        modules=modules,
        max_tokens=max_tokens,
        include_toc=include_toc,
        include_guidelines=include_guidelines,
        project_slug=project_slug,
        export_format=export_format,
    )
    bundle = await handler.handle(command)

    projects = await project_repo.list_all()
    docs = await doc_repo.list_all(project_slug=project_slug)
    tree: dict[str, list[Document]] = {}
    for d in docs:
        mod = d.module or "general"
        if mod not in tree:
            tree[mod] = []
        tree[mod].append(d)

    available_modules = sorted(list(tree.keys()))
    existing_bundles = await bundle_repo.list_bundles()

    format_label = ".cursorrules" if export_format == "cursorrules" else ".md"
    return templates.TemplateResponse(
        request=request,
        name="modules/context_bundler/views/bundler.html",
        context={
            "projects": projects,
            "active_project": project_slug,
            "tree": tree,
            "available_modules": available_modules,
            "existing_bundles": existing_bundles,
            "compiled_bundle": bundle,
            "selected_modules": modules,
            "max_tokens": max_tokens,
            "export_format": export_format,
            "success_message": f"Bundle generado exitosamente ({bundle.token_count:,} tokens en formato {format_label})",
        },
    )


@router.get("/{bundle_id}/download")
async def download_bundle_attachment(
    bundle_id: str,
    bundle_repo: Any = Depends(get_bundle_repo),
) -> FileResponse:
    """Download compiled context bundle as attachment (.md or .cursorrules)."""
    bundle = await bundle_repo.get_bundle(bundle_id)
    if not bundle or not Path(bundle.file_path).exists():
        raise EntityNotFoundException(f"Bundle {bundle_id} no encontrado")

    filename = Path(bundle.file_path).name
    media_type = "text/plain" if filename.endswith(".cursorrules") else "text/markdown"
    return FileResponse(
        path=bundle.file_path,
        media_type=media_type,
        filename=filename,
    )


