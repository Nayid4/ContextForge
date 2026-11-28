"""Synchronous structural & business pre-validator protocol for a Command or Query."""

from __future__ import annotations

from typing import Protocol, TypeVar

from domain.common import DomainError

TRequest = TypeVar("TRequest")


class IValidator(Protocol[TRequest]):
    def validate(self, request: TRequest) -> list[DomainError]: ...
