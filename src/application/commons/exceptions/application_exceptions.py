"""Application Layer Cross-Cutting Exceptions."""

from __future__ import annotations


class ApplicationException(Exception):
    """Base exception for application use case workflows."""

    def __init__(self, message: str, details: dict[str, str] | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.details = details or {}


class ValidationException(ApplicationException):
    """Raised when input command/query validation fails."""

    def __init__(self, message: str, errors: dict[str, str] | None = None) -> None:
        super().__init__(message, details=errors or {})
        self.errors = errors or {}


class NotFoundException(ApplicationException):
    """Raised when an entity or resource requested by a use case does not exist."""

    def __init__(self, resource: str, identifier: str) -> None:
        super().__init__(f"{resource} with identifier '{identifier}' was not found.")
        self.resource = resource
        self.identifier = identifier
