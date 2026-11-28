"""Dual Editor blocks-to-markdown compile payload."""
from __future__ import annotations
from typing import Any
from pydantic import BaseModel, Field

class CompileBlocksPayload(BaseModel):
    title: str = "Sin título"
    module: str = "general"
    library_id: str = "default"
    tags: list[str] = Field(default_factory=list)
    description: str = ""
    blocks: list[dict[str, Any]] = Field(default_factory=list)
