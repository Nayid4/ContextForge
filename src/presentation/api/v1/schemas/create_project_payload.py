"""CreateProject REST payload."""
from __future__ import annotations
from pydantic import BaseModel

class CreateProjectPayload(BaseModel):
    name: str
    slug: str | None = None
    path: str = "./docs"
    description: str = ""
    sovereign_only: bool = False
    max_quota_mb: int = 1024
