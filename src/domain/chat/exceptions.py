"""Chat Domain Exceptions."""

from __future__ import annotations

from domain.shared_kernel.exceptions import DomainException


class ChatException(DomainException):
    """Base exception for chat and scoped RAG operations."""
    pass


class ChatSessionNotFoundException(ChatException):
    """Raised when a specific scoped chat session is not found."""

    def __init__(self, session_id: str) -> None:
        super().__init__(f"Chat session '{session_id}' was not found.")
        self.session_id = session_id
