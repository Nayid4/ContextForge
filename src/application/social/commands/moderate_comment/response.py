"""ModerateComment response DTO."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ModerateCommentResponse:
    """Response DTO for ModerateCommentCommand."""

    comment_id: str
    success: bool
    message: str = ""
