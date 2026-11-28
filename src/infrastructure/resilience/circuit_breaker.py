"""Async CircuitBreaker resilience pattern implementation."""

from __future__ import annotations

import time
from typing import Awaitable, Callable, TypeVar

from infrastructure.resilience.circuit_breaker_error import CircuitBreakerOpenError
from infrastructure.resilience.circuit_state import CircuitState

T = TypeVar("T")


class CircuitBreaker:
    def __init__(self, name: str, failure_threshold: int = 3, recovery_timeout_sec: float = 20.0) -> None:
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout_sec = recovery_timeout_sec
        self.state = CircuitState.CLOSED
        self.failures = 0
        self.opened_at = 0.0

    async def call(self, fn: Callable[[], Awaitable[T]]) -> T:
        now = time.monotonic()
        if self.state == CircuitState.OPEN:
            if now - self.opened_at >= self.recovery_timeout_sec:
                self.state = CircuitState.HALF_OPEN
            else:
                raise CircuitBreakerOpenError(f"CircuitBreaker '{self.name}' abierto temporalmente.")
        try:
            res = await fn()
            self.failures = 0
            self.state = CircuitState.CLOSED
            return res
        except Exception:
            self.failures += 1
            if self.failures >= self.failure_threshold:
                self.state = CircuitState.OPEN
                self.opened_at = time.monotonic()
            raise
