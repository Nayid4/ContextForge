"""Domain Entities for Scoped Document Chat and Pinpointed Attribution."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


@dataclass
class DocumentSourceRef:
    """Precise source attribution reference with granular location."""

    document_path: str
    location: str  # e.g., "Pág. 3", "Líneas 10-25", "Hoja: Métricas", "Documento Completo"
    excerpt: str
    is_attachment: bool = False
    attachment_name: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "document_path": self.document_path,
            "location": self.location,
            "excerpt": self.excerpt,
            "is_attachment": self.is_attachment,
            "attachment_name": self.attachment_name,
        }


@dataclass
class ChatMessage:
    """Single chat turn in a document scoped conversation."""

    id: str
    role: str  # "user" | "assistant" | "system"
    content: str
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    sources: list[DocumentSourceRef] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "role": self.role,
            "content": self.content,
            "timestamp": self.timestamp.isoformat(),
            "sources": [s.to_dict() for s in self.sources],
        }


@dataclass
class ScopedChatSession:
    """Scoped chat session confined to a specific document and its attachments."""

    session_id: str
    book_id: str
    library_id: str
    messages: list[ChatMessage] = field(default_factory=list)

