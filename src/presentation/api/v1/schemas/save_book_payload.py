"""Dual Editor unified save book payload."""
from __future__ import annotations
from typing import Any
from pydantic import BaseModel, Field

class SaveBookPayload(BaseModel):
    title: str
    module: str = "general"
    library_id: str = "default"
    tags: list[str] = Field(default_factory=list)
    description: str = ""
    raw_markdown: str = ""
    blocks: list[dict[str, Any]] = Field(default_factory=list)
    doc_path: str | None = None
    status: str = "published"
    expected_version: int | None = None
