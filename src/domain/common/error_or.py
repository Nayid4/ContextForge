"""Result monad representing either a valid value T or a list of DomainErrors."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Generic, TypeVar

from domain.common.domain_error import DomainError
from domain.common.domain_exception import DomainException

T = TypeVar("T")


@dataclass(frozen=True)
class ErrorOr(Generic[T]):
    _value: T | None = None
    _errors: tuple[DomainError, ...] = ()

    @property
    def is_error(self) -> bool:
        return len(self._errors) > 0

    @property
    def value(self) -> T:
        if self.is_error or self._value is None:
            err = self._errors[0] if self._errors else DomainError("empty_value", "No value present")
            raise DomainException(err)
        return self._value

    @property
    def errors(self) -> tuple[DomainError, ...]:
        return self._errors

    @property
    def first_error(self) -> DomainError:
        return self._errors[0]

    @classmethod
    def ok(cls, value: T) -> ErrorOr[T]:
        return cls(_value=value, _errors=())

    @classmethod
    def fail(cls, *errors: DomainError) -> ErrorOr[T]:
        return cls(_value=None, _errors=tuple(errors))
