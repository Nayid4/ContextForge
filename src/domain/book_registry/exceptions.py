"""Book Registry Domain Exceptions."""

from __future__ import annotations

from domain.shared_kernel.exceptions import DomainException


class BookRegistryException(DomainException):
    """Base exception for book registry operations."""
    pass


class DraftNotFoundException(BookRegistryException):
    """Raised when a requested book draft is not found."""

    def __init__(self, draft_id: str) -> None:
        super().__init__(f"Book draft with ID '{draft_id}' was not found.")
        self.draft_id = draft_id


class AttachmentNotFoundException(BookRegistryException):
    """Raised when an attachment is not found on disk or metadata."""

    def __init__(self, attachment_id: str) -> None:
        super().__init__(f"Attachment with ID '{attachment_id}' was not found.")
        self.attachment_id = attachment_id
