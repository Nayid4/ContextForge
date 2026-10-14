"""Knowledge Docs Web Presentation Routes."""

from __future__ import annotations

from pathlib import Path
from typing import Any
import uuid
from fastapi import APIRouter, Cookie, Depends, Form, Request, status
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.domain.project import IProjectRepository
from core.templates.blueprints import list_blueprints
from domain.shared_kernel.exceptions import EntityNotFoundException
from application.knowledge_docs.commands import CreateDocumentCommand, IngestDocsCommand
from application.knowledge_docs.handlers import (
    CreateDocumentCommandHandler,
    GetDocumentDetailQueryHandler,
    GetDocumentsQueryHandler,
    IngestDocsCommandHandler,
)
from application.knowledge_docs.queries import GetDocumentDetailQuery, GetDocumentsQuery
from infrastructure.database.orm_models import DocumentCommentModel
from infrastructure.external.markdown_parser import MarkdownParserService
from presentation.api.dependencies import (
    get_create_doc_handler,
    get_db_session,
    get_document_detail_handler,
    get_documents_handler,
    get_ingest_docs_handler,
    get_markdown_parser,
    get_project_repo,
)

TEMPLATES_DIR = Path(__file__).resolve().parent.parent.parent
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

router = APIRouter(tags=["Frontend: Knowledge Docs"])


@router.get("/", response_class=HTMLResponse)
async def home_redirect() -> Any:
    """Redirect root to docs browser."""
    return RedirectResponse(url="/docs/browser", status_code=status.HTTP_302_FOUND)


@router.get("/docs/browser", response_class=HTMLResponse)
async def docs_browser_view(
    request: Request,
    module: str | None = None,
    q: str | None = None,
    project: str | None = None,
    cf_active_project: str | None = Cookie(default=None),
    handler: GetDocumentsQueryHandler = Depends(get_documents_handler),
) -> HTMLResponse:
    """Docs-as-Code dashboard showing Markdown knowledge files."""
    active_slug = project or cf_active_project or "default"
    docs = await handler.handle(GetDocumentsQuery(module=module, search=q, project_slug=active_slug))

    # Extract distinct modules for filter tabs
    all_docs = await handler.handle(GetDocumentsQuery(project_slug=active_slug))
    available_modules = sorted(list({d.module for d in all_docs if d.module}))

    return templates.TemplateResponse(
        request=request,
        name="modules/knowledge_docs/views/docs_browser.html",
        context={
            "docs": docs,
            "selected_module": module,
            "search_query": q,
            "active_project": active_slug,
            "available_modules": available_modules,
            "total_docs": len(all_docs),
        },
    )


@router.get("/books/editor", response_class=HTMLResponse)
@router.get("/docs/editor", response_class=HTMLResponse)
async def dual_doc_editor_view(
    request: Request,
    cf_active_project: str | None = Cookie(default=None),
    project: str | None = None,
    module: str | None = None,
    path: str | None = None,
    doc_path: str | None = None,
    project_repo: IProjectRepository = Depends(get_project_repo),
    doc_handler: GetDocumentDetailQueryHandler = Depends(get_document_detail_handler),
) -> HTMLResponse:
    """Render Dual Mode Editor (Markdown Pro vs. Block Builder)."""
    projects = await project_repo.list_all()
    active_slug = project or cf_active_project or (projects[0].slug.value if projects else "default")
    active_module = module or "architecture"
    blueprints = list_blueprints()

    target_path = path or doc_path
    existing_doc = None
    if target_path and target_path.strip():
        try:
            existing_doc = await doc_handler.handle(
                GetDocumentDetailQuery(relative_path=target_path.strip(), project_slug=active_slug)
            )
            if existing_doc:
                active_slug = existing_doc.project_slug
                active_module = existing_doc.module
        except EntityNotFoundException:
            existing_doc = None

    return templates.TemplateResponse(
        request=request,
        name="modules/BookRegistry/views/editor.html",
        context={
            "projects": projects,
            "project_slug": active_slug,
            "active_slug": active_slug,
            "module": active_module,
            "blueprints": blueprints,
            "existing_doc": existing_doc,
        },
    )



@router.get("/docs/new", response_class=HTMLResponse)
async def new_doc_editor_view(
    request: Request,
    cf_active_project: str | None = Cookie(default=None),
    project_repo: IProjectRepository = Depends(get_project_repo),
) -> HTMLResponse:
    """Render split-screen Markdown documentation editor with blueprint scaffolding."""
    projects = await project_repo.list_all()
    active_slug = cf_active_project or (projects[0].slug.value if projects else "default")
    blueprints = list_blueprints()

    default_markdown = """# Título de la Especificación o Regla

## 1. Resumen y Contexto
Describe aquí el objetivo de esta arquitectura, regla de negocio o política.

## 2. Reglas Técnicas
- Regla 1: Reintentos exponenciales con jitter.
- Regla 2: Idempotencia requerida en webhooks.

```mermaid
graph TD
    A[Cliente] --> B[API Gateway]
    B --> C[Worker Local]
```

```python
def process_event(event_id: str) -> None:
    # Código indivisible por el Semantic Chunker
    pass
```
"""
    return templates.TemplateResponse(
        request=request,
        name="modules/knowledge_docs/views/doc_editor.html",
        context={
            "initial_markdown": default_markdown,
            "projects": projects,
            "active_slug": active_slug,
            "blueprints": blueprints,
        },
    )


@router.post("/docs/preview-htmx", response_class=HTMLResponse)
async def preview_markdown_htmx(
    content_markdown: str = Form(""),
    parser: MarkdownParserService = Depends(get_markdown_parser),
) -> HTMLResponse:
    """Real-time Markdown to HTML preview via HTMX."""
    rendered = parser.render(content_markdown)
    return HTMLResponse(content=rendered.html_content)


@router.post("/docs/new", response_class=HTMLResponse)
async def create_doc_view(
    request: Request,
    title: str = Form(...),
    module: str = Form(...),
    filename: str = Form(...),
    project_slug: str = Form("default"),
    author: str = Form("Equipo Técnico"),
    tags: str = Form(""),
    content_markdown: str = Form(...),
    handler: CreateDocumentCommandHandler = Depends(get_create_doc_handler),
) -> Any:
    """Create a new Markdown document, save to disk, and index into ChromaDB & BM25."""
    clean_filename = filename.strip()
    if not clean_filename.endswith(".md"):
        clean_filename += ".md"

    clean_project = project_slug.strip().lower() or "default"
    if clean_project != "default":
        relative_path = f"{clean_project}/modules/{module.strip()}/{clean_filename}"
    else:
        relative_path = f"modules/{module.strip()}/{clean_filename}"

    parsed_tags = [t.strip() for t in tags.split(",") if t.strip()]

    command = CreateDocumentCommand(
        relative_path=relative_path,
        title=title.strip(),
        module=module.strip(),
        content_markdown=content_markdown,
        project_slug=clean_project,
        author=author.strip(),
        tags=parsed_tags,
    )
    doc = await handler.handle(command)
    return RedirectResponse(url=f"/docs/view/{doc.path}", status_code=status.HTTP_302_FOUND)



@router.post("/docs/reindex", response_class=HTMLResponse)
async def reindex_docs_htmx(
    handler: IngestDocsCommandHandler = Depends(get_ingest_docs_handler),
) -> HTMLResponse:
    """HTMX endpoint to scan ./docs and index all chunks into ChromaDB & BM25."""
    indexed_chunks = await handler.handle(IngestDocsCommand(target_directory="./docs"))
    html = f"""
    <div class="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold animate-pulse">
        <i class="fa-solid fa-check-double"></i>
        <span>{indexed_chunks} chunks indexados (ChromaDB + BM25)</span>
    </div>
    """
    return HTMLResponse(content=html)


@router.get("/docs/view/{path:path}", response_class=HTMLResponse)
async def doc_detail_view(
    request: Request,
    path: str,
    doc_handler: GetDocumentDetailQueryHandler = Depends(get_document_detail_handler),
    parser: MarkdownParserService = Depends(get_markdown_parser),
    session: AsyncSession = Depends(get_db_session),
) -> HTMLResponse:
    """Document reader with rendered Markdown, metadata drawer, and comment thread."""
    doc = await doc_handler.handle(GetDocumentDetailQuery(relative_path=path))
    rendered = parser.render(doc.content_markdown)

    # Discover unique attachments for this document
    unique_attachments: list[dict[str, str]] = []
    seen_att_names: set[str] = set()

    for chunk in doc.chunks:
        if chunk.source_type == "attachment" and chunk.attachment_name and chunk.attachment_name not in seen_att_names:
            seen_att_names.add(chunk.attachment_name)
            doc_stem = Path(doc.path).stem
            rel_asset = f"{doc.project_slug}/assets/{doc_stem}/{chunk.attachment_name}"
            ext = chunk.attachment_name.split(".")[-1].lower() if "." in chunk.attachment_name else ""
            unique_attachments.append({
                "name": chunk.attachment_name,
                "url": f"/api/v1/assets/{rel_asset}",
                "location": chunk.location or "Anexo",
                "ext": ext,
            })

    doc_stem = Path(doc.path).stem
    possible_asset_dirs = [
        Path("./docs") / doc.project_slug / "assets" / doc_stem,
        Path("./docs") / "assets" / doc_stem,
    ]
    for adir in possible_asset_dirs:
        if adir.exists() and adir.is_dir():
            for f in adir.iterdir():
                if f.is_file() and f.name not in seen_att_names:
                    seen_att_names.add(f.name)
                    rel_asset = f"{doc.project_slug}/assets/{doc_stem}/{f.name}"
                    ext = f.suffix.lstrip(".").lower()
                    unique_attachments.append({
                        "name": f.name,
                        "url": f"/api/v1/assets/{rel_asset}",
                        "location": "Disco Local",
                        "ext": ext,
                    })

    # Fetch comments from SQLite
    query = (
        select(DocumentCommentModel)
        .where(DocumentCommentModel.doc_path == doc.path)
        .order_by(DocumentCommentModel.created_at.desc())
    )
    res = await session.execute(query)
    comments = res.scalars().all()

    return templates.TemplateResponse(
        request=request,
        name="modules/knowledge_docs/views/doc_detail.html",
        context={
            "doc": doc,
            "rendered": rendered,
            "comments": comments,
            "attachments": unique_attachments,
        },
    )


@router.post("/docs/view/{path:path}/comments", response_class=HTMLResponse)
async def add_doc_comment_view(
    request: Request,
    path: str,
    user_name: str = Form(...),
    content: str = Form(...),
    session: AsyncSession = Depends(get_db_session),
    doc_handler: GetDocumentDetailQueryHandler = Depends(get_document_detail_handler),
    parser: MarkdownParserService = Depends(get_markdown_parser),
) -> Any:
    """Add a developer comment to the document."""
    doc = await doc_handler.handle(GetDocumentDetailQuery(relative_path=path))

    new_comment = DocumentCommentModel(
        id=str(uuid.uuid4()),
        doc_path=doc.path,
        user_name=user_name.strip(),
        content=content.strip(),
    )
    session.add(new_comment)
    await session.commit()

    return RedirectResponse(url=f"/docs/view/{doc.path}#comments", status_code=status.HTTP_302_FOUND)


@router.get("/docs/integration-guide", response_class=HTMLResponse)
async def integration_guide_view(request: Request) -> HTMLResponse:
    """Render external API documentation and integration guide for ContextForge."""
    return templates.TemplateResponse(
        request=request,
        name="modules/knowledge_docs/views/integration_guide.html",
        context={},
    )

