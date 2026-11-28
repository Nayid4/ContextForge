"""Discussion thread / comment creation payload."""
from __future__ import annotations
from pydantic import BaseModel

class CommentPayload(BaseModel):
    doc_path: str
    project_slug: str = "default"
    content: str
    thread_id: str | None = None
    title: str | None = None
    section_anchor: str = ""
