"""User feedback (upvote/downvote) recorded against an AI/RAG answer."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass(frozen=True)
class AnswerFeedbackEntity:
    feedback_id: str
    project_slug: str
    agent_slug: str
    question: str
    answer_excerpt: str
    vote: str
    reason: str = ""
    user_id: str = "anonymous"
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
