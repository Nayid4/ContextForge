"""Transaction Pipeline Behavior using IUnitOfWork."""

from __future__ import annotations

from typing import Any, Callable, Coroutine, TypeVar
from application.commons.behaviors.base_behavior import IPipelineBehavior
from application.commons.interfaces.unit_of_work import IUnitOfWork

TRequest = TypeVar("TRequest")
TResponse = TypeVar("TResponse")


class TransactionBehavior(IPipelineBehavior[TRequest, TResponse]):
    """Wraps command handler execution in an atomic transaction."""

    def __init__(self, uow: IUnitOfWork) -> None:
        self._uow = uow

    async def handle(
        self,
        request: TRequest,
        next_call: Callable[[TRequest], Coroutine[Any, Any, TResponse]],
    ) -> TResponse:
        async with self._uow:
            response = await next_call(request)
            await self._uow.commit()
            return response
