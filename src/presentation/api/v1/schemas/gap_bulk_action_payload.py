"""Bulk action payload for Knowledge Gaps (resolve, ignore, assign)."""

from __future__ import annotations

from pydantic import BaseModel, Field


class GapBulkActionPayload(BaseModel):
    action: str = Field(..., pattern="^(resolve|ignore|assign)$")
    gap_ids: list[str] = Field(..., min_length=1, max_length=100)
    assigned_to: str = ""
    reason: str = ""
