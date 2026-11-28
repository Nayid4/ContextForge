"""Document create/update REST payload."""
from __future__ import annotations
from pydantic import BaseModel, Field

class DocumentWritePayload(BaseModel):
    path: str
    title: str
    content_markdown: str
    module_name: str = "general"
    project_slug: str = "default"
    tags: list[str] = Field(default_factory=list)
    status: str = "published"
    summary: str = ""
    expected_version: int | None = None
    is_locked: bool | None = None
    explicit_unlock: bool = False
    change_summary: str = "Actualización documental"
