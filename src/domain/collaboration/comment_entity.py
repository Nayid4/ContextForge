"""Normalized comment inside a discussion thread anchored to a document/section (REI-12)."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass(frozen=True)
class CommentEntity:
    id: str
    thread_id: str
    book_id: str
    project_slug: str
    author_name: str
    author_email: str
    section_anchor: str
    content: str
    author_id: str = ""
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    @property
    def user_name(self) -> str:
        return self.author_name
