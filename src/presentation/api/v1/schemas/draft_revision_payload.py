"""Draft revision payload for safely editing an already-published document without altering live published_version (BR-04)."""
from __future__ import annotations
from pydantic import BaseModel, Field


class DraftRevisionPayload(BaseModel):
    path: str = Field(..., min_length=1, max_length=300)
    project_slug: str = "default"
    title: str = Field(..., min_length=1, max_length=200)
    content_markdown: str = Field(..., min_length=1)
    change_summary: str = "Nueva revisión borrador (sin alterar versión publicada)"
