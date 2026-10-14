"""Logging Pipeline Behavior."""

from __future__ import annotations

import logging
import time
from typing import Any, Callable, Coroutine, TypeVar
from application.commons.behaviors.base_behavior import IPipelineBehavior

logger = logging.getLogger("application.cqrs")

TRequest = TypeVar("TRequest")
TResponse = TypeVar("TResponse")


class LoggingBehavior(IPipelineBehavior[TRequest, TResponse]):
    """Logs the execution timing and success/failure of requests."""

    async def handle(
        self,
        request: TRequest,
        next_call: Callable[[TRequest], Coroutine[Any, Any, TResponse]],
    ) -> TResponse:
        req_name = request.__class__.__name__
        start = time.perf_counter()
        logger.info("Executing %s", req_name)
        try:
            response = await next_call(request)
            elapsed_ms = (time.perf_counter() - start) * 1000
            logger.info("Completed %s in %.2fms", req_name, elapsed_ms)
            return response
        except Exception as e:
            elapsed_ms = (time.perf_counter() - start) * 1000
            logger.error("Failed %s in %.2fms: %s", req_name, elapsed_ms, e)
            raise
