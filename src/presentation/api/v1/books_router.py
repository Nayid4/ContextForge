"""Dual Mode Editor (Markdown <-> Blocks) & Asset Preview REST v1 Router (0 classes)."""

from __future__ import annotations

import re
from typing import Any
from fastapi import APIRouter, Depends, File, Form, Request, Response, UploadFile

from application.documents.commands.CreateDocument import CreateDocumentCommand
from application.documents.commands.UpdateDocument import UpdateDocumentCommand
from domain.common import DomainException
from domain.users import AuthPrincipal, PermissionAction
from infrastructure.di import DependencyContainer, get_container
from infrastructure.integrations import MarkdownBlockSerializer
from infrastructure.security import FileValidator
from presentation.api.dependencies import build_cqrs_context, require_permission
from presentation.api.v1.schemas import CompileBlocksPayload, ParseMarkdownPayload, SaveBookPayload

router = APIRouter(tags=["Dual Mode Editor & Assets"])


@router.post("/books/parse-markdown")
async def parse_markdown_to_blocks(
    payload: ParseMarkdownPayload,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE)),
) -> dict[str, Any]:
    metadata, blocks = MarkdownBlockSerializer.markdown_to_blocks(payload.raw_markdown)
    return {"metadata": metadata, "blocks": blocks}


@router.post("/books/compile-blocks")
async def compile_blocks_to_markdown(
    payload: CompileBlocksPayload,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE)),
) -> dict[str, Any]:
    raw_md = MarkdownBlockSerializer.blocks_to_markdown(
        title=payload.title,
        module=payload.module,
        library_id=payload.library_id,
        tags=payload.tags,
        description=payload.description,
        blocks=payload.blocks,
    )
    return {"raw_markdown": raw_md}


@router.post("/books/save")
async def save_editor_book(
    payload: SaveBookPayload,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    raw_md = payload.raw_markdown.strip()
    if not raw_md and payload.blocks:
        raw_md = MarkdownBlockSerializer.blocks_to_markdown(
            title=payload.title,
            module=payload.module,
            library_id=payload.library_id,
            tags=payload.tags,
            description=payload.description,
            blocks=payload.blocks,
        )
    if not raw_md:
        raw_md = f"# {payload.title}\n"

    slug = re.sub(r"[^a-z0-9_-]+", "_", payload.title.strip().lower()).strip("_") or "documento"
    target_path = (payload.doc_path or "").strip() or f"{payload.module}/{slug}.md"
    existing = await c.doc_repo.get_by_path(target_path, project_slug=payload.library_id)

    if existing is None:
        doc = await c.mediator.execute_or_raise(
            CreateDocumentCommand(
                path=target_path,
                title=payload.title,
                content_markdown=raw_md,
                module_name=payload.module,
                project_slug=payload.library_id,
                author=principal.display_name,
                tags=tuple(payload.tags),
                status=payload.status,
                summary=payload.description,
            ),
            context=build_cqrs_context(request, principal, payload.library_id),
        )
    else:
        doc = await c.mediator.execute_or_raise(
            UpdateDocumentCommand(
                path=target_path,
                title=payload.title,
                content_markdown=raw_md,
                module_name=payload.module,
                project_slug=payload.library_id,
                author=principal.display_name,
                tags=tuple(payload.tags),
                summary=payload.description,
                expected_version=payload.expected_version,
            ),
            context=build_cqrs_context(request, principal, payload.library_id),
        )
    return {"saved": True, "id": doc.id, "path": doc.path, "version": doc.current_version, "etag": doc.etag, "status": doc.status.value}


@router.post("/books/upload-attachment")
async def upload_editor_attachment(
    library_id: str = Form("default"),
    book_id: str = Form("doc"),
    file: UploadFile = File(...),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    raw = await file.read()
    fname = file.filename or "anexo.txt"
    val = FileValidator.validate(fname, raw, max_mb=c.settings.storage.max_attachment_size_mb)
    if val.is_error:
        raise DomainException(val.first_error)
    stored = await c.file_storage.save_bytes(
        category="attachments",
        project_slug=library_id,
        file_name=fname,
        content=raw,
        mime_type=file.content_type or "application/octet-stream",
    )
    is_image = (file.content_type or "").startswith("image/") or fname.lower().endswith((".png", ".jpg", ".jpeg", ".svg", ".webp", ".gif"))
    return {
        "file_name": stored.file_name,
        "file_path": stored.storage_key,
        "mime_type": stored.mime_type,
        "size_bytes": stored.size_bytes,
        "is_image": is_image,
    }


@router.get("/assets/{project_slug}/{asset_key:path}")
async def serve_stored_asset(
    project_slug: str,
    asset_key: str,
    c: DependencyContainer = Depends(get_container),
) -> Response:
    try:
        data = await c.file_storage.read_bytes(asset_key)
    except FileNotFoundError:
        return Response(status_code=404)
    lower = asset_key.lower()
    mime = (
        "application/pdf" if lower.endswith(".pdf")
        else "image/png" if lower.endswith(".png")
        else "image/jpeg" if lower.endswith((".jpg", ".jpeg"))
        else "image/webp" if lower.endswith(".webp")
        else "image/gif" if lower.endswith(".gif")
        else "image/svg+xml" if lower.endswith(".svg")
        else "application/vnd.openxmlformats-officedocument.wordprocessingml.document" if lower.endswith(".docx")
        else "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" if lower.endswith(".xlsx")
        else "text/csv; charset=utf-8" if lower.endswith(".csv")
        else "application/json; charset=utf-8" if lower.endswith(".json")
        else "text/plain; charset=utf-8" if lower.endswith(".txt")
        else "text/markdown; charset=utf-8" if lower.endswith(".md")
        else "application/octet-stream"
    )
    return Response(content=data, media_type=mime, headers={"Content-Disposition": "inline"})
