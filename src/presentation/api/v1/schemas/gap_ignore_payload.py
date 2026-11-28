"""Knowledge gap ignore payload requiring explicit justification."""

from __future__ import annotations

from pydantic import BaseModel, Field


class GapIgnorePayload(BaseModel):
    reason: str = Field(..., min_length=3, max_length=500)
