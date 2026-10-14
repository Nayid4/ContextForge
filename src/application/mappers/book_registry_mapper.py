"""Book Registry and Attachment DTO Mappers."""

from __future__ import annotations

from typing import Any
from domain.book_registry.entities import Attachment, DocumentBlock, DraftBook


class BookRegistryMapper:
    """Transforms Book Registry domain entities to structured dictionaries and DTOs."""

    @staticmethod
    def attachment_to_dto(attachment: Attachment) -> dict[str, Any]:
        return {
            "id": attachment.id,
            "book_id": attachment.book_id,
            "file_name": attachment.file_name,
            "file_path": attachment.file_path,
            "mime_type": attachment.mime_type,
            "size_bytes": attachment.size_bytes,
            "uploaded_at": attachment.uploaded_at.isoformat(),
        }

    @staticmethod
    def block_to_dto(block: DocumentBlock) -> dict[str, Any]:
        return block.to_dict()

    @staticmethod
    def draft_to_dto(draft: DraftBook) -> dict[str, Any]:
        return {
            "id": draft.id,
            "library_id": draft.library_id,
            "module": draft.module,
            "title": draft.title,
            "description": draft.description,
            "tags": list(draft.tags),
            "raw_markdown": draft.raw_markdown,
            "attachments": [BookRegistryMapper.attachment_to_dto(a) for a in draft.attachments],
            "created_at": draft.created_at.isoformat(),
        }


# Compatibility alias
AttachmentMapper = BookRegistryMapper
