"""Command for querying project knowledge base via Universal AI Engine."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class AskProjectContextCommand:
    """Command to ask a RAG-grounded question against a specific project's knowledge base."""

    project_slug: str
    user_query: str
    module_filter: str | None = None
    provider_override: str = ""
    stream: bool = False

