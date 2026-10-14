"""Social Domain Exceptions."""

from __future__ import annotations

from domain.shared_kernel.exceptions import DomainException


class SocialException(DomainException):
    """Base exception for social domain."""
    pass


class CommentNotFoundException(SocialException):
    """Raised when a specific comment cannot be found."""

    def __init__(self, comment_id: str) -> None:
        super().__init__(f"Comment with ID '{comment_id}' was not found.")
        self.comment_id = comment_id
