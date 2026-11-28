"""CircuitBreaker state enumeration."""

from __future__ import annotations

from enum import Enum


class CircuitState(str, Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"
