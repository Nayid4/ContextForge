"""Uploads a validated attachment, extracts text and indexes extracted_text into RAG indexes."""

from __future__ import annotations

from typing import Any, Callable, Coroutine
import uuid

from application.documents.commands.UploadAttachment.UploadAttachmentCommand import UploadAttachmentCommand
from domain.common import ErrorOr
from domain.documents import AttachmentEntity, DocumentAggregate, IDocumentRepositoryPort
from domain.ports import IFileStorageService


class UploadAttachmentCommandHandler:
    def __init__(
        self,
        doc_repo: IDocumentRepositoryPort,
        storage_service: IFileStorageService,
        text_extractor: Callable[[str, bytes], str] | None = None,
        index_attachment_callback: Callable[[AttachmentEntity, DocumentAggregate | None], Coroutine[Any, Any, Any]] | None = None,
    ) -> None:
        self._doc_repo = doc_repo
        self._storage = storage_service
        self._extractor = text_extractor
        self._index_attachment = index_attachment_callback

    async def handle(self, request: UploadAttachmentCommand) -> ErrorOr[AttachmentEntity]:
        doc = await self._doc_repo.get_by_path(request.book_path, project_slug=request.project_slug)
        book_id = doc.id if doc else f"{request.project_slug}:{request.book_path}"
        stored = await self._storage.save_bytes(
            category="attachments",
            project_slug=request.project_slug,
            file_name=request.file_name,
            content=request.content_bytes,
            mime_type=request.mime_type,
        )
        extracted = ""
        if self._extractor is not None:
            try:
                extracted = self._extractor(request.file_name, request.content_bytes)
            except Exception:
                extracted = ""
        entity = AttachmentEntity(
            id=str(uuid.uuid4()),
            book_id=book_id,
            project_slug=request.project_slug,
            file_name=stored.file_name,
            storage_key=stored.storage_key,
            mime_type=stored.mime_type,
            size_bytes=stored.size_bytes,
            sha256_checksum=stored.sha256_checksum,
            extracted_text=extracted,
        )
        saved = await self._doc_repo.save_attachment(entity)
        if self._index_attachment is not None and saved.extracted_text.strip():
            await self._index_attachment(saved, doc)
        return ErrorOr.ok(saved)
