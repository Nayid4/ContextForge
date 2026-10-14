"""AskScopedDocument query definition."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class AskScopedDocumentQuery:
    """Query to ask a pinpointed question to a document with Zero-RAG Bypass or Scoped RAG."""

    library_id: str
    book_id: str
    query: str
    raw_markdown: str = ""
    history: list[dict[str, str]] = field(default_factory=list)
