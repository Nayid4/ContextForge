"""Registry providing named CircuitBreaker instances."""

from __future__ import annotations

from infrastructure.resilience.circuit_breaker import CircuitBreaker


class ResilienceRegistry:
    _breakers: dict[str, CircuitBreaker] = {}

    @classmethod
    def get_breaker(cls, name: str) -> CircuitBreaker:
        if name not in cls._breakers:
            cls._breakers[name] = CircuitBreaker(name=name)
        return cls._breakers[name]
