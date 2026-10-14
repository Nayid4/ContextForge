"""Base Pipeline Behavior Protocol for Mediator."""

from __future__ import annotations

from typing import Any, Callable, Coroutine, Protocol, TypeVar

TRequest = TypeVar("TRequest")
TResponse = TypeVar("TResponse")


class IPipelineBehavior(Protocol[TRequest, TResponse]):
    """Pipeline middleware wrapping handler execution."""

    async def handle(
        self,
        request: TRequest,
        next_call: Callable[[TRequest], Coroutine[Any, Any, TResponse]],
    ) -> TResponse:
        ...
