"""AddComment command definition."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class AddCommentCommand:
    """Command to post a comment or technical annotation on a book / document."""

    target_id: str
    user_name: str
    user_email: str
    content: str
