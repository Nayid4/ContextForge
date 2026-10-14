"""GetBookDraft response DTO."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class GetBookDraftResponse:
    """Response containing retrieved draft if present."""

    draft: dict[str, Any] | None
    found: bool

