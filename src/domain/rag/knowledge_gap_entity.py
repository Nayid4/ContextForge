"""Unanswered question / documentation gap clustered by topic (captured on BR-08 abstention or user report)."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass(frozen=True)
class KnowledgeGapEntity:
    gap_id: str
    project_slug: str
    agent_slug: str
    question: str
    topic_cluster: str
    occurrences: int = 1
    status: str = "open"
    assigned_to: str = ""
    ignored_reason: str = ""
    resolved_by_doc_path: str = ""
    suggested_module: str = "general"
    last_asked_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
