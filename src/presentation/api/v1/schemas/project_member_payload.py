"""Project membership upsert payload."""
from __future__ import annotations
from pydantic import BaseModel, Field


class ProjectMemberPayload(BaseModel):
    user_id: str = Field(..., min_length=2, max_length=64)
    role: str = "Consumer"
