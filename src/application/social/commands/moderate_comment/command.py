"""ModerateComment command definition."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ModerateCommentCommand:
    """Command to moderate, approve, or delete a comment."""

    comment_id: str
    action: str  # "delete" | "approve" | "hide"
