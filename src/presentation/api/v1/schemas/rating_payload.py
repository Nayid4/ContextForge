"""Document rating upsert payload."""
from __future__ import annotations
from pydantic import BaseModel

class RatingPayload(BaseModel):
    doc_path: str
    project_slug: str = "default"
    score: int
