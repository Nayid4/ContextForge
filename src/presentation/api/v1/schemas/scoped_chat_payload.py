"""ScopedChatDrawer single-document question payload."""
from __future__ import annotations
from pydantic import BaseModel

class ScopedChatPayload(BaseModel):
    question: str
    document_title: str = "Documento"
    document_path: str = "doc.md"
    content_markdown: str = ""
    project_slug: str = "default"
