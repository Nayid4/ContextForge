"""GoF Structural Decorators for cross-cutting validation and operational auditing."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
import time
from typing import Callable, Generic, TypeVar

TResult = TypeVar("TResult")


@dataclass(frozen=True)
class AuditRecord:
    """Single execution trace entry recorded by :class:`AuditingOperationDecorator`."""

    operation: str
    succeeded: bool
    latency_ms: float
    timestamp: str
    error_code: str | None = None


class OperationExecutor(Generic[TResult]):
    """Base callable wrapper representing an executable operation."""

    def __init__(self, operation_name: str, fn: Callable[[], TResult]) -> None:
        self.operation_name = operation_name
        self._fn = fn

    def execute(self) -> TResult:
        return self._fn()


class AuditingOperationDecorator(OperationExecutor[TResult]):
    """Structural Decorator that measures latency and appends structured audit records."""

    def __init__(
        self,
        wrapped: OperationExecutor[TResult],
        audit_sink: list[AuditRecord],
        enabled: bool = True,
    ) -> None:
        self.operation_name = wrapped.operation_name
        self._wrapped = wrapped
        self._audit_sink = audit_sink
        self._enabled = enabled

    def execute(self) -> TResult:
        started = time.perf_counter()
        try:
            result = self._wrapped.execute()
            elapsed = round((time.perf_counter() - started) * 1000.0, 2)
            if self._enabled:
                self._audit_sink.append(
                    AuditRecord(
                        operation=self.operation_name,
                        succeeded=True,
                        latency_ms=elapsed,
                        timestamp=datetime.now(timezone.utc).isoformat(),
                    )
                )
            return result
        except Exception as exc:
            elapsed = round((time.perf_counter() - started) * 1000.0, 2)
            if self._enabled:
                self._audit_sink.append(
                    AuditRecord(
                        operation=self.operation_name,
                        succeeded=False,
                        latency_ms=elapsed,
                        timestamp=datetime.now(timezone.utc).isoformat(),
                        error_code=getattr(exc, "code", type(exc).__name__),
                    )
                )
            raise
