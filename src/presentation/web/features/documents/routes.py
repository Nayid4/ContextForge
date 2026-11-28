"""Documents Browser, Reader, Live Preview & Reindex Web Routes (0 classes)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Form, Query, Request
from fastapi.responses import HTMLResponse, RedirectResponse

from application.collaboration.commands.PostDocumentComment import PostDocumentCommentCommand
from application.documents.queries.ListDocumentsPaginated import ListDocumentsPaginatedQuery
from application.projects.commands.SyncFilesystemDocs import SyncFilesystemDocsCommand
from domain.common import PageParams
from infrastructure.di import DependencyContainer, get_container
from infrastructure.integrations import RichMarkdownRenderer
from presentation.web.shared.jinja_templates import resolve_active_project_slug, templates

router = APIRouter(tags=["Web: Documents"])


@router.get("/", response_class=HTMLResponse)
async def home_redirect(request: Request, c: DependencyContainer = Depends(get_container)) -> HTMLResponse:
    return await docs_browser_view(request=request, project=None, module=None, q="", page=1, per_page=9, c=c)


@router.get("/docs/browser", response_class=HTMLResponse)
async def docs_browser_view(
    request: Request,
    project: str | None = Query(None),
    module: str | None = Query(None),
    q: str = Query(""),
    page: int = Query(1, ge=1),
    per_page: int = Query(9, ge=1, le=50),
    c: DependencyContainer = Depends(get_container),
) -> HTMLResponse:
    active_project = await resolve_active_project_slug(request, c, project)
    paged = await c.mediator.execute_or_raise(
        ListDocumentsPaginatedQuery(
            project_slug=active_project,
            module_name=None if (not module or module == "all") else module,
            search=q.strip() or None,
            page=page,
            page_size=per_page,
        )
    )
    all_docs = await c.doc_repo.list_all(project_slug=active_project)
    available_modules = sorted({d.module_name for d in all_docs if d.module_name})
    resp = templates.TemplateResponse(
        request=request,
        name="features/documents/views/docs_browser.html",
        context={
            "active_project": active_project,
            "docs": paged.items,
            "total_docs": paged.total_count,
            "current_page": paged.page,
            "total_pages": paged.total_pages,
            "per_page": paged.page_size,
            "has_prev": paged.has_prev,
            "has_next": paged.has_next,
            "selected_module": module or "all",
            "available_modules": available_modules,
            "search_query": q,
        },
    )
    if project:
        resp.set_cookie("cf_active_project", active_project, httponly=False, samesite="lax")
    return resp


@router.post("/docs/reindex", response_class=HTMLResponse)
async def reindex_docs_htmx(
    request: Request,
    project: str | None = Query(None),
    c: DependencyContainer = Depends(get_container),
) -> HTMLResponse:
    active_project = await resolve_active_project_slug(request, c, project)
    summary = await c.mediator.execute_or_raise(SyncFilesystemDocsCommand(project_slug=active_project))
    return HTMLResponse(
        f'<span class="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-mono text-[11px]">'
        f'Indexado: +{summary.added_count} / ~{summary.updated_count} ({summary.duration_ms:.0f} ms)</span>'
    )


@router.post("/docs/preview-htmx", response_class=HTMLResponse)
async def preview_markdown_htmx(content_markdown: str = Form("")) -> HTMLResponse:
    if not content_markdown.strip():
        return HTMLResponse('<p class="text-slate-400 italic text-sm">Sin contenido para previsualizar.</p>')
    return HTMLResponse(RichMarkdownRenderer.render(content_markdown))


@router.get("/docs/view/{doc_path:path}", response_class=HTMLResponse)
async def doc_detail_view(
    doc_path: str,
    request: Request,
    project: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    c: DependencyContainer = Depends(get_container),
) -> HTMLResponse:
    active_project = await resolve_active_project_slug(request, c, project)
    doc = await c.doc_repo.get_by_path(doc_path, project_slug=active_project)
    if doc is None:
        return RedirectResponse(url="/docs/browser", status_code=302)  # type: ignore[return-value]
    attachments = await c.doc_repo.list_attachments(doc.id)
    paged_threads = await c.collab_repo.list_threads_paginated(
        doc.id,
        active_project,
        pagination=PageParams(page=page, page_size=per_page),
    )
    comments = [cm for t in paged_threads.items for cm in t.comments]
    versions = await c.doc_repo.list_versions(doc.id)
    rating = await c.collab_repo.get_rating_summary(doc.id)
    return templates.TemplateResponse(
        request=request,
        name="features/documents/views/doc_detail.html",
        context={
            "doc": doc,
            "html_content": RichMarkdownRenderer.render(doc.content_markdown),
            "attachments": attachments,
            "comments": comments,
            "comments_page": paged_threads.page,
            "comments_total_pages": paged_threads.total_pages,
            "comments_total": paged_threads.total_count,
            "comments_per_page": paged_threads.page_size,
            "comments_has_prev": paged_threads.has_prev,
            "comments_has_next": paged_threads.has_next,
            "version_count": len(versions),
            "rating": rating,
        },
    )


@router.post("/docs/view/{doc_path:path}/comments")
async def post_doc_comment_web(
    doc_path: str,
    request: Request,
    user_name: str = Form(...),
    content: str = Form(...),
    project: str | None = Query(None),
    c: DependencyContainer = Depends(get_container),
) -> RedirectResponse:
    active_project = await resolve_active_project_slug(request, c, project)
    await c.mediator.send(
        PostDocumentCommentCommand(
            doc_path=doc_path,
            project_slug=active_project,
            author_name=user_name,
            content=content,
        )
    )
    return RedirectResponse(url=f"/docs/view/{doc_path}?project={active_project}#comments", status_code=303)
