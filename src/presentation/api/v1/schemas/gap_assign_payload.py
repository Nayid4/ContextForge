"""Knowledge gap assignment payload."""

from __future__ import annotations

from pydantic import BaseModel, Field


class GapAssignPayload(BaseModel):
    assigned_to: str = Field(..., min_length=1, max_length=64)
