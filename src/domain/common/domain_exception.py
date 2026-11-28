"""Exception wrapper carrying a typed DomainError for boundary mapping."""

from __future__ import annotations

from domain.common.domain_error import DomainError


class DomainException(Exception):
    def __init__(self, error: DomainError) -> None:
        super().__init__(error.message)
        self.error = error
