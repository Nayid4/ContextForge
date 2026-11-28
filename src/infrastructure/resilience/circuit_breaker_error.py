"""Exception raised when an open CircuitBreaker short-circuits execution."""

from __future__ import annotations


class CircuitBreakerOpenError(RuntimeError):
    pass
