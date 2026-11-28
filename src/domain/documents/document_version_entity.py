"""Immutable document version snapshot entity (RF-DOC-004, BR-06)."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass(frozen=True)
class DocumentVersionEntity:
    version_id: str
    book_id: str
    version_number: int
    content_markdown: str
    content_hash: str
    author_id: str
    status_snapshot: str
    change_summary: str = ""
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
