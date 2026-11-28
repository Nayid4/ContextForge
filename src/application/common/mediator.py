"""CQRS Mediator orchestrating Validators, PipelineBehaviors, and RequestHandlers."""

from __future__ import annotations

from typing import Any, Callable, TypeVar

from application.common.i_pipeline_behavior import IPipelineBehavior, NextStepCallable
from application.common.i_request_handler import IRequestHandler
from application.common.i_validator import IValidator
from application.common.validation_pipeline_behavior import ValidationPipelineBehavior
from domain.common import DomainError, DomainException, ErrorOr

TResult = TypeVar("TResult")


class Mediator:
    def __init__(self, behaviors: list[IPipelineBehavior] | None = None) -> None:
        self._handler_factories: dict[type[Any], Callable[[], IRequestHandler[Any, Any]]] = {}
        self._validators: dict[type[Any], IValidator[Any]] = {}
        self._custom_behaviors: list[IPipelineBehavior] = list(behaviors or [])

    def register(
        self,
        request_type: type[Any],
        handler_factory: Callable[[], IRequestHandler[Any, Any]],
        validator: IValidator[Any] | None = None,
    ) -> None:
        self._handler_factories[request_type] = handler_factory
        if validator is not None:
            self._validators[request_type] = validator

    def add_behavior(self, behavior: IPipelineBehavior) -> None:
        self._custom_behaviors.append(behavior)

    async def send(self, request: Any, context: dict[str, Any] | None = None) -> ErrorOr[Any]:
        req_type = type(request)
        factory = self._handler_factories.get(req_type)
        if factory is None:
            return ErrorOr.fail(
                DomainError(
                    code="unregistered_cqrs_request",
                    message=f"No existe handler registrado para '{req_type.__name__}'.",
                )
            )

        ctx = dict(context or {})
        handler = factory()
        validation_behavior = ValidationPipelineBehavior(self._validators)
        all_behaviors: list[IPipelineBehavior] = [validation_behavior, *self._custom_behaviors]

        async def invoke_handler() -> ErrorOr[Any]:
            return await handler.handle(request)

        pipeline: NextStepCallable = invoke_handler
        for behavior in reversed(all_behaviors):
            current_behavior = behavior
            next_fn = pipeline

            async def wrapped(b: IPipelineBehavior = current_behavior, nxt: NextStepCallable = next_fn) -> ErrorOr[Any]:
                return await b.handle(request, nxt, ctx)

            pipeline = wrapped

        return await pipeline()

    async def execute_or_raise(self, request: Any, context: dict[str, Any] | None = None) -> Any:
        result = await self.send(request, context=context)
        if result.is_error:
            raise DomainException(result.first_error)
        return result.value
