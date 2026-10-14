"""Validation Pipeline Behavior."""

from __future__ import annotations

from typing import Any, Callable, Coroutine, Protocol, TypeVar
from application.commons.behaviors.base_behavior import IPipelineBehavior
from application.commons.exceptions.application_exceptions import ValidationException

TRequest = TypeVar("TRequest")
TResponse = TypeVar("TResponse")
TRequest_contra = TypeVar("TRequest_contra", contravariant=True)


class IValidator(Protocol[TRequest_contra]):
    """Validator protocol for incoming request."""

    def validate(self, request: TRequest_contra) -> None:
        ...


class ValidationBehavior(IPipelineBehavior[TRequest, TResponse]):
    """Runs registered validators before executing request handler."""

    def __init__(self, validators: list[IValidator[TRequest]] | None = None) -> None:
        self._validators = validators or []

    async def handle(
        self,
        request: TRequest,
        next_call: Callable[[TRequest], Coroutine[Any, Any, TResponse]],
    ) -> TResponse:
        for validator in self._validators:
            try:
                validator.validate(request)
            except Exception as e:
                if not isinstance(e, ValidationException):
                    raise ValidationException(str(e))
                raise
        return await next_call(request)
