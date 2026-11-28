"""Dual Editor markdown-to-blocks parse payload."""
from __future__ import annotations
from pydantic import BaseModel

class ParseMarkdownPayload(BaseModel):
    raw_markdown: str = ""
