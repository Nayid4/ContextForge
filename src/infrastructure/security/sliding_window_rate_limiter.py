"""In-memory per-client sliding window rate limiter & daily quota guard per API key / agent (RIC-05, BR-18)."""

from __future__ import annotations

from collections import defaultdict, deque
from datetime import datetime, timezone
import time

from domain.common import DomainError, ErrorOr, ErrorType


class SlidingWindowRateLimiter:
    def __init__(self) -> None:
        self._buckets: dict[str, deque[float]] = defaultdict(deque)
        self._daily_counts: dict[str, int] = defaultdict(int)

    def check(self, key: str, limit_per_minute: int) -> ErrorOr[bool]:
        now = time.monotonic()
        window_start = now - 60.0
        dq = self._buckets[key]
        while dq and dq[0] < window_start:
            dq.popleft()
        if len(dq) >= limit_per_minute:
            return ErrorOr.fail(
                DomainError(
                    code="rate_limit_exceeded",
                    message=f"Límite de peticiones excedido ({limit_per_minute}/min). Intente nuevamente en unos segundos.",
                    error_type=ErrorType.RATE_LIMITED,
                )
            )
        dq.append(now)
        return ErrorOr.ok(True)

    def check_daily_quota(self, key: str, daily_limit: int) -> ErrorOr[int]:
        """Enforces a per-UTC-day request quota for an API key or AI Agent to prevent runaway cloud LLM costs."""
        if daily_limit <= 0:
            return ErrorOr.ok(0)
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        bucket_key = f"{today}:{key}"
        current = self._daily_counts[bucket_key]
        if current >= daily_limit:
            return ErrorOr.fail(
                DomainError(
                    code="daily_quota_exceeded",
                    message=f"Cuota diaria excedida ({daily_limit} solicitudes/día) para '{key}'.",
                    error_type=ErrorType.RATE_LIMITED,
                )
            )
        self._daily_counts[bucket_key] = current + 1
        return ErrorOr.ok(self._daily_counts[bucket_key])
