"""AddComment response DTO."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class AddCommentResponse:
    """Response DTO for AddCommentCommand."""

    comment_id: str
    success: bool
    message: str = ""
    comment: dict[str, Any] | None = None
