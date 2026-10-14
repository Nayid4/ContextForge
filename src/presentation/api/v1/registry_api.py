"""Registry & Document Assets and Scoped Chat API v1."""

from __future__ import annotations

import mimetypes
import os
from pathlib import Path
import shutil
from typing import Any
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

from application.chat.services import ScopedChatService
from core.use_cases.ingest_docs import IngestDocsUseCase
from domain.knowledge_docs.repositories import IDocumentRepository
from infrastructure.external.markdown_parser import MarkdownParser
from presentation.api.dependencies import (
    get_doc_repo,
    get_ingest_docs_use_case,
    get_scoped_chat_service,
)

router = APIRouter(tags=["Book Registry & Scoped RAG"])

DOCS_BASE = Path("./docs").resolve()


class ScopedChatRequest(BaseModel):
    """Payload for Scoped Document Chat query."""

    library_id: str = Field(..., description="Project / Library unique slug")
    book_id: str = Field(..., description="Document slug or relative path")
    query: str = Field(..., description="User question directed to this document")
    raw_markdown: str = Field(default="", description="Optional full raw markdown content")
    history: list[dict[str, str]] = Field(default_factory=list, description="Conversational history turns")


class SaveBookRequest(BaseModel):
    """Payload to save or compile a book from visual blocks or raw markdown."""

    title: str = Field(..., description="Document title")
    module: str = Field(default="general", description="Functional module")
    library_id: str = Field(default="default", description="Project slug")
    tags: list[str] = Field(default_factory=list, description="Document tags")
    description: str = Field(default="", description="Brief description")
    raw_markdown: str = Field(default="", description="Raw markdown content")
    blocks: list[dict[str, Any]] = Field(default_factory=list, description="Visual blocks")
    doc_path: str | None = Field(default=None, description="Original relative doc path if updating an existing file in place")


class ParseMarkdownRequest(BaseModel):
    raw_markdown: str = Field(..., description="Raw markdown to parse into visual blocks")


class CompileBlocksRequest(BaseModel):
    title: str = Field(default="Sin Título")
    module: str = Field(default="general")
    library_id: str = Field(default="default")
    tags: list[str] = Field(default_factory=list)
    description: str = Field(default="")
    blocks: list[dict[str, Any]] = Field(default_factory=list)



@router.post("/books/upload-attachment", status_code=status.HTTP_201_CREATED)
async def upload_attachment(
    library_id: str = Form(...),
    book_id: str = Form(...),
    file: UploadFile = File(...),
) -> dict[str, Any]:
    """Upload a sovereign local attachment into ./docs/{library_id}/assets/{book_id}/."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Nombre de archivo inválido.")

    clean_lib = library_id.strip().lower()
    clean_book = book_id.strip().lower().replace(".md", "").replace("/", "_")

    upload_dir = (DOCS_BASE / clean_lib / "assets" / clean_book).resolve()
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Safe destination path
    dest_path = (upload_dir / file.filename).resolve()
    if not str(dest_path).startswith(str(DOCS_BASE)):
        raise HTTPException(status_code=400, detail="Ruta de destino inválida o insegura.")

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    size = dest_path.stat().st_size
    content_type = file.content_type or mimetypes.guess_type(dest_path.name)[0] or "application/octet-stream"
    is_image = content_type.startswith("image/")

    return {
        "file_name": file.filename,
        "file_path": f"assets/{clean_book}/{file.filename}",
        "mime_type": content_type,
        "is_image": is_image,
        "size_bytes": size,
    }


@router.get("/assets/{path:path}")
async def serve_asset(path: str) -> FileResponse:
    """Serve a local file asset with correct MIME type and caching headers."""
    clean_path = path.replace("\\", "/").strip("/")
    target = (DOCS_BASE / clean_path).resolve()

    # Directory traversal prevention
    if not str(target).startswith(str(DOCS_BASE)):
        raise HTTPException(status_code=403, detail="Acceso denegado a la ruta solicitada.")

    if not target.exists() or not target.is_file():
        raise HTTPException(status_code=404, detail="Archivo anexo no encontrado en disco local.")

    mime_type, _ = mimetypes.guess_type(str(target))
    return FileResponse(
        path=str(target),
        media_type=mime_type or "application/octet-stream",
        content_disposition_type="inline",
        filename=target.name,
    )


@router.post("/chat/scoped")
async def scoped_chat_endpoint(
    payload: ScopedChatRequest,
    scoped_chat: ScopedChatService = Depends(get_scoped_chat_service),
    doc_repo: IDocumentRepository = Depends(get_doc_repo),
) -> dict[str, Any]:
    """Execute Scoped RAG against the specified document and its local attachments."""
    raw_md = payload.raw_markdown

    # Auto-load markdown if omitted
    if not raw_md:
        doc = await doc_repo.get_by_path(payload.book_id, project_slug=payload.library_id)
        if doc:
            raw_md = doc.content_markdown

    result = await scoped_chat.answer_question(
        library_id=payload.library_id,
        book_id=payload.book_id,
        raw_markdown=raw_md,
        user_query=payload.query,
        history=payload.history,
    )
    return result


@router.post("/books/save")
async def save_book_endpoint(
    payload: SaveBookRequest,
    doc_repo: IDocumentRepository = Depends(get_doc_repo),
    ingest_use_case: IngestDocsUseCase = Depends(get_ingest_docs_use_case),
) -> dict[str, Any]:
    """Save document to disk compiling from blocks or direct Markdown, then re-index."""
    final_markdown = payload.raw_markdown

    # If raw_markdown is empty but blocks provided, compile via MarkdownParser
    if not final_markdown.strip() and payload.blocks:
        from domain.book_registry.entities import (
            AttachmentBlock,
            CodeBlock,
            DocumentBlock,
            HeadingBlock,
            MermaidBlock,
            ParagraphBlock,
        )

        domain_blocks: list[DocumentBlock] = []
        for b in payload.blocks:
            b_type = b.get("type")
            if b_type == "heading":
                domain_blocks.append(HeadingBlock(level=int(b.get("level", 2)), text=str(b.get("text", ""))))
            elif b_type == "paragraph":
                domain_blocks.append(ParagraphBlock(text=str(b.get("text", ""))))
            elif b_type == "code":
                domain_blocks.append(CodeBlock(language=str(b.get("language", "text")), code=str(b.get("code", ""))))
            elif b_type == "mermaid":
                domain_blocks.append(MermaidBlock(code=str(b.get("code", ""))))
            elif b_type == "attachment":
                domain_blocks.append(
                    AttachmentBlock(
                        file_name=str(b.get("file_name", "")),
                        file_path=str(b.get("file_path", "")),
                        mime_type=str(b.get("mime_type", "application/octet-stream")),
                        is_image=bool(b.get("is_image", False)),
                        caption=b.get("caption"),
                    )
                )

        final_markdown = MarkdownParser.blocks_to_markdown(
            title=payload.title,
            module=payload.module,
            library_id=payload.library_id,
            tags=payload.tags,
            description=payload.description,
            blocks=domain_blocks,
        )

    if payload.doc_path and payload.doc_path.strip():
        clean_path = payload.doc_path.replace("\\", "/").strip("/")
        if clean_path.startswith("docs/"):
            clean_path = clean_path.removeprefix("docs/").strip("/")
        rel_path = clean_path
    else:
        slug_name = payload.title.lower().replace(" ", "-")
        rel_path = f"{payload.library_id}/{payload.module}/{slug_name}.md"

    doc = await doc_repo.save_document(
        relative_path=rel_path,
        content=final_markdown,
        project_slug=payload.library_id,
    )

    # Ingest updated project
    await ingest_use_case.execute(project_slug=payload.library_id)

    return {
        "status": "success",
        "path": doc.path,
        "title": doc.title,
        "chunks_count": len(doc.chunks),
    }


@router.post("/books/parse-markdown")
async def parse_markdown_endpoint(payload: ParseMarkdownRequest) -> dict[str, Any]:
    """Parse Markdown text into structured Frontmatter and visual blocks."""
    meta, blocks = MarkdownParser.markdown_to_blocks(payload.raw_markdown)
    return {
        "metadata": meta,
        "blocks": [b.to_dict() for b in blocks],
    }


@router.post("/books/compile-blocks")
async def compile_blocks_endpoint(payload: CompileBlocksRequest) -> dict[str, Any]:
    """Compile visual blocks to Markdown with Frontmatter."""
    from domain.book_registry.entities import (
        AttachmentBlock,
        CodeBlock,
        DocumentBlock,
        HeadingBlock,
        MermaidBlock,
        ParagraphBlock,
    )

    domain_blocks: list[DocumentBlock] = []
    for b in payload.blocks:
        b_type = b.get("type")
        if b_type == "heading":
            domain_blocks.append(HeadingBlock(level=int(b.get("level", 2)), text=str(b.get("text", ""))))
        elif b_type == "paragraph":
            domain_blocks.append(ParagraphBlock(text=str(b.get("text", ""))))
        elif b_type == "code":
            domain_blocks.append(CodeBlock(language=str(b.get("language", "text")), code=str(b.get("code", ""))))
        elif b_type == "mermaid":
            domain_blocks.append(MermaidBlock(code=str(b.get("code", ""))))
        elif b_type == "attachment":
            domain_blocks.append(
                AttachmentBlock(
                    file_name=str(b.get("file_name", "")),
                    file_path=str(b.get("file_path", "")),
                    mime_type=str(b.get("mime_type", "application/octet-stream")),
                    is_image=bool(b.get("is_image", False)),
                    caption=b.get("caption"),
                )
            )

    compiled_md = MarkdownParser.blocks_to_markdown(
        title=payload.title,
        module=payload.module,
        library_id=payload.library_id,
        tags=payload.tags,
        description=payload.description,
        blocks=domain_blocks,
    )
    return {"raw_markdown": compiled_md}


