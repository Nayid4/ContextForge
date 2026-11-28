"""Editorial state transition REST payload."""
from __future__ import annotations
from pydantic import BaseModel

class TransitionPayload(BaseModel):
    path: str
    target_status: str
    project_slug: str = "default"
    reason: str = ""
