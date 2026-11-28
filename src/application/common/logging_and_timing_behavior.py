"""CQRS PipelineBehavior recording latency and structured diagnostic logs."""

from __future__ import annotations

import logging
import time
from typing import Any

from application.common.i_pipeline_behavior import NextStepCallable
from domain.common import ErrorOr

logger = logging.getLogger("contextforge.cqrs")


class LoggingAndTimingBehavior:
    async def handle(
        self,
        request: Any,
        next_step: NextStepCallable,
        context: dict[str, Any],
    ) -> ErrorOr[Any]:
        t0 = time.perf_counter()
        result = await next_step()
        elapsed_ms = round((time.perf_counter() - t0) * 1000.0, 2)
        context["latency_ms"] = elapsed_ms
        logger.debug("CQRS %s completed in %.2f ms (error=%s)", type(request).__name__, elapsed_ms, result.is_error)
        return result
