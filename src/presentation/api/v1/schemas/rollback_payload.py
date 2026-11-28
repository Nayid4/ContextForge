"""Non-destructive document version rollback payload."""
from __future__ import annotations
from pydantic import BaseModel

class RollbackPayload(BaseModel):
    path: str
    target_version: int
    reason: str
    project_slug: str = "default"
