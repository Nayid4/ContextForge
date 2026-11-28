"""Document steward and review freshness governance update payload (BR-24)."""

from __future__ import annotations

from pydantic import BaseModel, Field


class DocumentGovernancePayload(BaseModel):
    path: str = Field(..., min_length=1, max_length=300)
    steward_user_id: str | None = None
    review_interval_days: int | None = Field(default=None, ge=7, le=730)
    mark_reviewed: bool = False
