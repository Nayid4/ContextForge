"""Scoped RAG/Agent conversation session isolated by project, optional book and agent version."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass(frozen=True)
class ChatSessionEntity:
    session_id: str
    project_slug: str
    book_id: str | None = None
    user_id: str | None = None
    agent_id: str | None = None
    agent_version: int | None = None
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
