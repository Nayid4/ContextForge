"""Chat DTO Mappers for Scoped RAG and Sessions."""

from __future__ import annotations

from typing import Any
from domain.chat.entities import ChatMessage, DocumentSourceRef, ScopedChatSession


class ChatMapper:
    """Transforms Chat domain entities to structured dictionaries and DTOs."""

    @staticmethod
    def source_ref_to_dto(source: DocumentSourceRef) -> dict[str, Any]:
        return {
            "document_path": source.document_path,
            "location": source.location,
            "excerpt": source.excerpt,
            "is_attachment": source.is_attachment,
            "attachment_name": source.attachment_name,
        }

    @staticmethod
    def message_to_dto(message: ChatMessage) -> dict[str, Any]:
        return {
            "id": message.id,
            "role": message.role,
            "content": message.content,
            "timestamp": message.timestamp.isoformat(),
            "sources": [ChatMapper.source_ref_to_dto(s) for s in message.sources],
        }

    @staticmethod
    def session_to_dto(session: ScopedChatSession) -> dict[str, Any]:
        return {
            "session_id": session.session_id,
            "book_id": session.book_id,
            "library_id": session.library_id,
            "messages": [ChatMapper.message_to_dto(m) for m in session.messages],
        }
