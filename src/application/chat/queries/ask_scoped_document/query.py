"""AskScopedDocument query definition."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class AskScopedDocumentQuery:
    """Query to ask a pinpointed question to a document with Zero-RAG Bypass or Scoped RAG."""

    library_id: str
    book_id: str
    query: str
    raw_markdown: str = ""
