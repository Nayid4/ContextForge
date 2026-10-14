"""RAG Engine Application Queries with Multi-Project Support."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class AskRagQuery:
    """Query to retrieve context and infer response via local Ollama LLM for a specific project."""

    query: str
    project_slug: str = "default"
    top_k: int = 5
    model: str | None = None


@dataclass(frozen=True)
class SearchHybridQuery:
    """Query to run Reciprocal Rank Fusion search across dense and lexical indexes for a specific project."""

    query: str
    project_slug: str = "default"
    top_k: int = 5
