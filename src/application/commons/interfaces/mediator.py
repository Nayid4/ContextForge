"""Mediator Pattern Interface for CQRS."""

from __future__ import annotations

from typing import Any, Callable, Coroutine, Protocol, TypeVar

TRequest_contra = TypeVar("TRequest_contra", contravariant=True)
TResponse_co = TypeVar("TResponse_co", covariant=True)


class IRequestHandler(Protocol[TRequest_contra, TResponse_co]):
    """Handler protocol for command or query processing."""

    async def handle(self, request: TRequest_contra) -> TResponse_co:
        ...


class IMediator(Protocol):
    """Mediator protocol for dispatching requests to handlers."""

    async def send(self, request: Any) -> Any:
        ...

    def register(
        self,
        request_type: type,
        handler_factory: Callable[[], Coroutine[Any, Any, Any] | Any],
    ) -> None:
        ...
