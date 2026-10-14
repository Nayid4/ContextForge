"""Docs-as-Code Knowledge Documents REST API."""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field
from application.knowledge_docs.commands import CreateDocumentCommand, IngestDocsCommand
from application.knowledge_docs.handlers import (
    CreateDocumentCommandHandler,
    GetDocumentDetailQueryHandler,
    GetDocumentsQueryHandler,
    IngestDocsCommandHandler,
)
from application.knowledge_docs.queries import GetDocumentDetailQuery, GetDocumentsQuery
from presentation.api.dependencies import (
    get_create_doc_handler,
    get_document_detail_handler,
    get_documents_handler,
    get_ingest_docs_handler,
)

router = APIRouter(prefix="/docs-api", tags=["Knowledge Docs"])


class DocumentItem(BaseModel):
    path: str
    title: str
    module: str
    tags: list[str]
    author: str
    project_slug: str = "default"


class DocumentDetailResponse(DocumentItem):
    content_markdown: str


class CreateDocumentRequest(BaseModel):
    relative_path: str = Field(..., description="e.g. modules/billing/new_feature.md")
    title: str
    module: str = "general"
    content_markdown: str
    project_slug: str = "default"
    author: str = "Equipo Técnico"
    tags: list[str] = []


@router.get("", response_model=list[DocumentItem])
async def list_documents(
    module: str | None = Query(None, description="Filter by module"),
    q: str | None = Query(None, description="Search keyword in docs"),
    project: str | None = Query(None, description="Filter by project slug"),
    handler: GetDocumentsQueryHandler = Depends(get_documents_handler),
) -> Any:
    """List all documentation files."""
    docs = await handler.handle(GetDocumentsQuery(module=module, search=q, project_slug=project))
    return docs


@router.get("/{path:path}", response_model=DocumentDetailResponse)
async def get_document(
    path: str,
    project: str | None = Query(None, description="Filter by project slug"),
    handler: GetDocumentDetailQueryHandler = Depends(get_document_detail_handler),
) -> Any:
    """Retrieve document by relative path."""
    doc = await handler.handle(GetDocumentDetailQuery(relative_path=path, project_slug=project))
    return doc


@router.post("/ingest")
async def ingest_documentation_directory(
    target_dir: str = Query("./docs", description="Directory to scan and index"),
    project: str | None = Query(None, description="Optional project slug to isolate re-indexing"),
    handler: IngestDocsCommandHandler = Depends(get_ingest_docs_handler),
) -> Any:
    """Scan and index Markdown files into ChromaDB and BM25 with project isolation."""
    indexed_chunks = await handler.handle(IngestDocsCommand(target_directory=target_dir, project_slug=project))
    return {"message": "Indexación completada exitosamente", "indexed_chunks": indexed_chunks}


@router.post("", response_model=DocumentDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    payload: CreateDocumentRequest,
    handler: CreateDocumentCommandHandler = Depends(get_create_doc_handler),
) -> Any:
    """Create a new Markdown document and index it."""
    command = CreateDocumentCommand(
        relative_path=payload.relative_path,
        title=payload.title,
        module=payload.module,
        content_markdown=payload.content_markdown,
        project_slug=payload.project_slug,
        author=payload.author,
        tags=payload.tags,
    )
    doc = await handler.handle(command)
    return doc

