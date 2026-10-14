"""AskScopedDocument response DTO."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class AskScopedDocumentResponse:
    """Response containing AI generated answer and pinpointed source locations."""

    answer: str
    sources: list[dict[str, Any]]
