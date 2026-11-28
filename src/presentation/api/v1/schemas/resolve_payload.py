"""Discussion thread resolve toggle payload."""
from __future__ import annotations
from pydantic import BaseModel

class ResolvePayload(BaseModel):
    resolved: bool = True
    project_slug: str = "default"
