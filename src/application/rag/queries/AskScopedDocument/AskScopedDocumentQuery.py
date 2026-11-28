"""AskScopedDocument Query DTO powering ScopedChatDrawer on Document Viewer & Editor."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from application.common import IQuery


@dataclass(frozen=True)
class AskScopedDocumentQuery(IQuery[dict[str, Any]]):
    question: str
    document_title: str
    document_path: str
    content_markdown: str
    project_slug: str = "default"
