"""Sync conflict resolution payload (BR-20)."""
from __future__ import annotations
from pydantic import BaseModel, Field


class SyncResolvePayload(BaseModel):
    path: str = Field(..., min_length=1, max_length=300)
    project_slug: str = "default"
    strategy: str = Field("keep_db_and_write_disk", pattern="^(keep_db_and_write_disk|accept_disk)$")
