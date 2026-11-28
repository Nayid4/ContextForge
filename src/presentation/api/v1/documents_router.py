"""Documents, Editorial Lifecycle, Diff, Rollback & Attachments REST v1 Router (0 classes)."""

from __future__ import annotations

from dataclasses import asdict
from pathlib import Path
from typing import Any
from fastapi import APIRouter, Depends, File, Form, Header, Query, Request, Response, UploadFile

from application.documents.commands.CreateDocument import CreateDocumentCommand
from application.documents.commands.DeleteDocument import DeleteDocumentCommand
from application.documents.commands.RollbackDocumentVersion import RollbackDocumentVersionCommand
from application.documents.commands.TransitionDocumentState import TransitionDocumentStateCommand
from application.documents.commands.UpdateDocument import UpdateDocumentCommand
from application.documents.commands.UploadAttachment import UploadAttachmentCommand
from application.documents.queries.CompareDocumentVersions import CompareDocumentVersionsQuery
from application.documents.queries.GetDocumentDetail import GetDocumentDetailQuery
from application.documents.queries.GetDocumentVersions import GetDocumentVersionsQuery
from application.documents.queries.ListDocumentsPaginated import ListDocumentsPaginatedQuery
from domain.common import DomainError, DomainException
from domain.documents import EditorialStatus, compute_sha256_text
from domain.users import AuthPrincipal, PermissionAction
from infrastructure.di import DependencyContainer, get_container
from infrastructure.integrations import RichMarkdownRenderer
from infrastructure.security import FileValidator
from presentation.api.dependencies import build_cqrs_context, require_permission
from presentation.api.v1.schemas import DocumentWritePayload, RollbackPayload, TransitionPayload
from presentation.api.v1.schemas.draft_revision_payload import DraftRevisionPayload
from presentation.api.v1.schemas.sync_resolve_payload import SyncResolvePayload

router = APIRouter(prefix="/documents", tags=["Documents, Versioning & Editorial (DOC)"])


def _parse_if_match_version(if_match: str | None) -> int | None:
    if not if_match:
        return None
    cleaned = if_match.replace("W/", "").replace('"', "").strip()
    if cleaned.startswith("v") and "-" in cleaned:
        num = cleaned[1:].split("-", 1)[0]
        if num.isdigit():
            return int(num)
    if cleaned.isdigit():
        return int(cleaned)
    return None


@router.get("")
async def list_documents(
    project: str = Query("default"),
    module: str | None = Query(None),
    status: str | None = Query(None),
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE, project_param="project")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    paged = await c.mediator.execute_or_raise(
        ListDocumentsPaginatedQuery(project_slug=project, module_name=module, status=status, search=search, page=page, page_size=page_size)
    )
    return {
        "items": [
            {
                "id": d.id,
                "path": d.path,
                "slug": d.slug,
                "title": d.title,
                "module_name": d.module_name,
                "project_slug": d.project_slug,
                "author": d.author,
                "tags": list(d.tags),
                "status": d.status.value,
                "is_locked": d.is_locked,
                "current_version": d.current_version,
                "published_version": d.published_version,
                "content_hash": d.content_hash,
                "last_synced_hash": d.last_synced_hash,
                "sync_status": d.sync_status,
                "etag": d.etag,
                "word_count": d.word_count,
                "updated_at": d.updated_at.isoformat(),
            }
            for d in paged.items
        ],
        "page": paged.page,
        "page_size": paged.page_size,
        "total_count": paged.total_count,
        "total_pages": paged.total_pages,
        "has_prev": paged.has_prev,
        "has_next": paged.has_next,
    }


@router.get("/detail")
async def get_document_detail(
    response: Response,
    path: str = Query(...),
    project: str = Query("default"),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE, project_param="project")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    doc = await c.mediator.execute_or_raise(GetDocumentDetailQuery(path=path, project_slug=project))
    attachments = await c.doc_repo.list_attachments(doc.id)
    rating = await c.collab_repo.get_rating_summary(doc.id, user_identifier=principal.subject_id)
    response.headers["ETag"] = doc.etag
    return {
        "id": doc.id,
        "path": doc.path,
        "title": doc.title,
        "module_name": doc.module_name,
        "project_slug": doc.project_slug,
        "author": doc.author,
        "tags": list(doc.tags),
        "status": doc.status.value,
        "is_locked": doc.is_locked,
        "current_version": doc.current_version,
        "published_version": doc.published_version,
        "content_hash": doc.content_hash,
        "last_synced_hash": doc.last_synced_hash,
        "sync_status": doc.sync_status,
        "etag": doc.etag,
        "content_markdown": doc.content_markdown,
        "html_content": RichMarkdownRenderer.render(doc.content_markdown),
        "word_count": doc.word_count,
        "rating": asdict(rating),
        "attachments": [
            {
                "id": a.id,
                "file_name": a.file_name,
                "mime_type": a.mime_type,
                "size_bytes": a.size_bytes,
                "sha256_checksum": a.sha256_checksum,
                "uploaded_at": a.uploaded_at.isoformat(),
            }
            for a in attachments
        ],
    }


@router.post("", status_code=201)
async def create_document(
    payload: DocumentWritePayload,
    request: Request,
    response: Response,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    chk = principal.can_perform(PermissionAction.WRITE_DOCUMENT, project_slug=payload.project_slug)
    if chk.is_error:
        raise DomainException(chk.first_error)
    doc = await c.mediator.execute_or_raise(
        CreateDocumentCommand(
            path=payload.path,
            title=payload.title,
            content_markdown=payload.content_markdown,
            module_name=payload.module_name,
            project_slug=payload.project_slug,
            author=principal.display_name,
            tags=tuple(payload.tags),
            status=payload.status,
            summary=payload.summary,
        ),
        context=build_cqrs_context(request, principal, payload.project_slug),
    )
    response.headers["ETag"] = doc.etag
    return {"saved": True, "id": doc.id, "path": doc.path, "version": doc.current_version, "status": doc.status.value, "etag": doc.etag}


@router.put("")
async def update_document(
    payload: DocumentWritePayload,
    request: Request,
    response: Response,
    if_match: str | None = Header(default=None, alias="If-Match"),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    chk = principal.can_perform(PermissionAction.WRITE_DOCUMENT, project_slug=payload.project_slug)
    if chk.is_error:
        raise DomainException(chk.first_error)
    exp_ver = payload.expected_version if payload.expected_version is not None else _parse_if_match_version(if_match)
    doc = await c.mediator.execute_or_raise(
        UpdateDocumentCommand(
            path=payload.path,
            title=payload.title,
            content_markdown=payload.content_markdown,
            module_name=payload.module_name,
            project_slug=payload.project_slug,
            author=principal.display_name,
            tags=tuple(payload.tags),
            expected_version=exp_ver,
            is_locked=payload.is_locked,
            explicit_unlock=payload.explicit_unlock,
            change_summary=payload.change_summary,
        ),
        context=build_cqrs_context(request, principal, payload.project_slug),
    )
    response.headers["ETag"] = doc.etag
    return {"saved": True, "path": doc.path, "version": doc.current_version, "etag": doc.etag, "status": doc.status.value}


@router.patch("/state")
async def transition_editorial_state(
    payload: TransitionPayload,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.PUBLISH_EDITORIAL)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    doc = await c.mediator.execute_or_raise(
        TransitionDocumentStateCommand(
            path=payload.path,
            target_status=payload.target_status,
            project_slug=payload.project_slug,
            actor=principal.display_name,
            reason=payload.reason,
        ),
        context=build_cqrs_context(request, principal, payload.project_slug),
    )
    return {"path": doc.path, "status": doc.status.value, "version": doc.current_version, "etag": doc.etag}


@router.get("/versions")
async def list_versions(
    path: str = Query(...),
    project: str = Query("default"),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE, project_param="project")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    versions = await c.mediator.execute_or_raise(GetDocumentVersionsQuery(path=path, project_slug=project))
    return {
        "versions": [
            {
                "version_id": v.version_id,
                "version_number": v.version_number,
                "content_hash": v.content_hash,
                "author_id": v.author_id,
                "status_snapshot": v.status_snapshot,
                "change_summary": v.change_summary,
                "created_at": v.created_at.isoformat(),
            }
            for v in versions
        ]
    }


@router.get("/diff")
async def diff_versions(
    path: str = Query(...),
    from_version: int = Query(..., ge=1),
    to_version: int = Query(..., ge=1),
    project: str = Query("default"),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE, project_param="project")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    diff_vo = await c.mediator.execute_or_raise(
        CompareDocumentVersionsQuery(path=path, from_version=from_version, to_version=to_version, project_slug=project)
    )
    return asdict(diff_vo)


@router.post("/rollback")
async def rollback_version(
    payload: RollbackPayload,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    doc = await c.mediator.execute_or_raise(
        RollbackDocumentVersionCommand(
            path=payload.path,
            target_version=payload.target_version,
            reason=payload.reason,
            project_slug=payload.project_slug,
            actor=principal.display_name,
        ),
        context=build_cqrs_context(request, principal, payload.project_slug),
    )
    return {"rolled_back": True, "path": doc.path, "new_version": doc.current_version, "etag": doc.etag}


@router.post("/attachments", status_code=201)
async def upload_attachment(
    request: Request,
    book_path: str = Form(...),
    project_slug: str = Form("default"),
    file: UploadFile = File(...),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    raw = await file.read()
    val = FileValidator.validate(file.filename or "unnamed", raw, max_mb=c.settings.storage.max_attachment_size_mb)
    if val.is_error:
        raise DomainException(val.first_error)
    att = await c.mediator.execute_or_raise(
        UploadAttachmentCommand(
            book_path=book_path,
            file_name=file.filename or "attachment.txt",
            mime_type=file.content_type or "application/octet-stream",
            content_bytes=raw,
            project_slug=project_slug,
            max_mb=c.settings.storage.max_attachment_size_mb,
        ),
        context=build_cqrs_context(request, principal, project_slug),
    )
    return {
        "id": att.id,
        "file_name": att.file_name,
        "mime_type": att.mime_type,
        "size_bytes": att.size_bytes,
        "sha256_checksum": att.sha256_checksum,
        "extracted_chars": len(att.extracted_text),
    }


@router.post("/draft-revision")
async def create_draft_revision_from_published(
    payload: DraftRevisionPayload,
    request: Request,
    response: Response,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    """BR-04: Creates a new draft revision of a published document without modifying live published_version or RAG."""
    chk = principal.can_perform(PermissionAction.WRITE_DOCUMENT, project_slug=payload.project_slug)
    if chk.is_error:
        raise DomainException(chk.first_error)
    doc = await c.doc_repo.get_by_path(payload.path, project_slug=payload.project_slug)
    if doc is None:
        raise DomainException(DomainError.not_found("document_not_found", f"Documento '{payload.path}' no encontrado."))
    ver_res = doc.apply_edit(
        title=payload.title,
        content_markdown=payload.content_markdown,
        author=principal.display_name,
        create_draft_revision=True,
        change_summary=payload.change_summary,
    )
    if ver_res.is_error:
        raise DomainException(ver_res.first_error)
    saved = await c.doc_repo.save(doc, ver_res.value, write_to_disk=False)  # type: ignore[call-arg]
    response.headers["ETag"] = saved.etag
    return {
        "saved": True,
        "path": saved.path,
        "status": saved.status.value,
        "current_version": saved.current_version,
        "published_version": saved.published_version,
        "etag": saved.etag,
    }


@router.post("/sync-resolve")
async def resolve_document_sync_conflict(
    payload: SyncResolvePayload,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    """BR-20: Explicitly resolves a dual disk/DB conflict ('in_conflict' or 'deleted_on_disk') without silent data loss."""
    chk = principal.can_perform(PermissionAction.WRITE_DOCUMENT, project_slug=payload.project_slug)
    if chk.is_error:
        raise DomainException(chk.first_error)
    doc = await c.doc_repo.get_by_path(payload.path, project_slug=payload.project_slug)
    if doc is None:
        raise DomainException(DomainError.not_found("document_not_found", f"Documento '{payload.path}' no encontrado."))
    proj = await c.project_repo.get_by_slug(payload.project_slug)
    root = Path(proj.path if proj else "./docs").resolve()
    target = (root / doc.path).resolve()
    if not target.is_relative_to(root):
        raise DomainException(DomainError.forbidden("path_escape", "Ruta fuera del directorio raíz del proyecto."))

    if payload.strategy == "keep_db_and_write_disk":
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(doc.content_markdown, encoding="utf-8")
        doc.mark_synced(doc.content_hash)
        saved = await c.doc_repo.save(doc, None, write_to_disk=False)  # type: ignore[call-arg]
        return {
            "resolved": True,
            "strategy": payload.strategy,
            "path": saved.path,
            "sync_status": saved.sync_status,
            "last_synced_hash": saved.last_synced_hash,
            "current_version": saved.current_version,
        }

    # strategy == "accept_disk"
    if not target.exists():
        raise DomainException(DomainError.not_found("disk_file_missing", f"El archivo '{doc.path}' no existe en disco para aceptar."))
    raw_disk = target.read_text(encoding="utf-8", errors="replace")
    disk_hash = compute_sha256_text(raw_disk)
    ver_res = doc.apply_edit(
        title=doc.title,
        content_markdown=raw_disk,
        author=principal.display_name,
        explicit_unlock=True,
        change_summary="Resolución de conflicto BR-20 (aceptar versión de disco)",
    )
    if ver_res.is_error:
        raise DomainException(ver_res.first_error)
    doc.mark_synced(disk_hash)
    saved = await c.doc_repo.save(doc, ver_res.value, write_to_disk=False)  # type: ignore[call-arg]
    if saved.status == EditorialStatus.PUBLISHED:
        await c.index_document_callback(saved)
    return {
        "resolved": True,
        "strategy": payload.strategy,
        "path": saved.path,
        "sync_status": saved.sync_status,
        "last_synced_hash": saved.last_synced_hash,
        "current_version": saved.current_version,
    }


@router.delete("")
async def delete_document(
    request: Request,
    path: str = Query(...),
    project: str = Query("default"),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT, project_param="project")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    deleted = await c.mediator.execute_or_raise(
        DeleteDocumentCommand(path=path, project_slug=project),
        context=build_cqrs_context(request, principal, project),
    )
    return {"deleted": deleted, "path": path}
