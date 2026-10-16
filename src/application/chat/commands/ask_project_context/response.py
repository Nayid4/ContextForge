"""Response DTOs for AskProjectContextCommand."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class SourceSnippetDTO:
    """Citation snippet from a retrieved document chunk."""

    document_title: str
    file_path: str
    location: str
    excerpt: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "document_title": self.document_title,
            "file_path": self.file_path,
            "location": self.location,
            "excerpt": self.excerpt,
        }


@dataclass(frozen=True)
class AskProjectContextResponse:
    """Result of executing a RAG query against the active Universal LLM/CLI engine."""

    answer: str
    engine_used: str
    sources: list[SourceSnippetDTO] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "answer": self.answer,
            "engine_used": self.engine_used,
            "sources": [s.to_dict() for s in self.sources],
        }

