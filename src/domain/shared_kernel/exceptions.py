"""Shared Kernel Domain Exceptions mapped to RFC 7807 concepts."""

from __future__ import annotations


class DomainException(Exception):
    """Base exception for all domain logic violations."""

    def __init__(self, message: str, status_code: int = 400) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class EntityNotFoundException(DomainException):
    """Raised when a requested entity does not exist."""

    def __init__(self, message: str) -> None:
        super().__init__(message=message, status_code=404)


class ValidationException(DomainException):
    """Raised when an invariant or input validation fails."""

    def __init__(self, message: str) -> None:
        super().__init__(message=message, status_code=422)


class BusinessRuleViolationException(DomainException):
    """Raised when a business invariant is violated."""

    def __init__(self, message: str) -> None:
        super().__init__(message=message, status_code=409)

