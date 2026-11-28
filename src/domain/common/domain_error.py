"""Immutable domain error descriptor (RFC 7807 ready)."""

from __future__ import annotations

from dataclasses import dataclass, field

from domain.common.error_type import ErrorType


@dataclass(frozen=True)
class DomainError:
    code: str
    message: str
    error_type: ErrorType = ErrorType.VALIDATION
    details: dict[str, object] = field(default_factory=dict)

    @staticmethod
    def validation(code: str, message: str, **details: object) -> DomainError:
        return DomainError(code=code, message=message, error_type=ErrorType.VALIDATION, details=details)

    @staticmethod
    def not_found(code: str, message: str, **details: object) -> DomainError:
        return DomainError(code=code, message=message, error_type=ErrorType.NOT_FOUND, details=details)

    @staticmethod
    def conflict(code: str, message: str, **details: object) -> DomainError:
        return DomainError(code=code, message=message, error_type=ErrorType.CONFLICT, details=details)

    @staticmethod
    def unauthorized(code: str, message: str) -> DomainError:
        return DomainError(code=code, message=message, error_type=ErrorType.UNAUTHORIZED)

    @staticmethod
    def forbidden(code: str, message: str, **details: object) -> DomainError:
        return DomainError(code=code, message=message, error_type=ErrorType.FORBIDDEN, details=details)

    @staticmethod
    def locked(code: str, message: str) -> DomainError:
        return DomainError(code=code, message=message, error_type=ErrorType.LOCKED)
