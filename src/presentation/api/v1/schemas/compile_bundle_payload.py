"""Context Bundle compilation payload."""
from __future__ import annotations
from pydantic import BaseModel, Field

class CompileBundlePayload(BaseModel):
    name: str
    project_slug: str = "default"
    document_paths: list[str] = Field(default_factory=list)
    query: str | None = None
    max_tokens: int = 4000
    export_format: str = "markdown"
