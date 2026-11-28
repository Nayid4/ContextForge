"""Answer feedback creation payload (thumbs up/down)."""
from __future__ import annotations
from pydantic import BaseModel, Field


class AnswerFeedbackPayload(BaseModel):
    agent_slug: str = ""
    question: str = Field(..., min_length=1, max_length=2000)
    answer_excerpt: str = ""
    vote: str = Field(..., pattern="^(up|down)$")
    reason: str = ""
