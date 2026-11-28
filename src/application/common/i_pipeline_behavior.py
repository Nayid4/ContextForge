"""Cross-cutting CQRS pipeline middleware protocol."""

from __future__ import annotations

from typing import Any, Callable, Coroutine, Protocol

from domain.common import ErrorOr

NextStepCallable = Callable[[], Coroutine[Any, Any, ErrorOr[Any]]]


class IPipelineBehavior(Protocol):
    async def handle(
        self,
        request: Any,
        next_step: NextStepCallable,
        context: dict[str, Any],
    ) -> ErrorOr[Any]: ...
