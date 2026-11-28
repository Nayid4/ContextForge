"""CQRS PipelineBehavior appending every mutating Command into the SHA-256 Audit Event Store (BR-14)."""

from __future__ import annotations

import time
from typing import Any

from application.common.i_command import ICommand
from application.common.i_pipeline_behavior import NextStepCallable
from domain.common import ErrorOr
from domain.ports import IEventStore


class AuditEventStoreBehavior:
    def __init__(self, event_store: IEventStore) -> None:
        self._event_store = event_store

    async def handle(
        self,
        request: Any,
        next_step: NextStepCallable,
        context: dict[str, Any],
    ) -> ErrorOr[Any]:
        t0 = time.perf_counter()
        result = await next_step()
        if isinstance(request, ICommand):
            lat = float(context.get("latency_ms") or round((time.perf_counter() - t0) * 1000.0, 2))
            res_id = str(
                getattr(request, "path", None)
                or getattr(request, "project_slug", None)
                or getattr(request, "slug", None)
                or getattr(request, "name", None)
                or getattr(request, "provider", None)
                or "system"
            )
            try:
                await self._event_store.append_audit(
                    actor_id=str(context.get("actor_id", "system")),
                    role=str(context.get("role", "System")),
                    project_slug=str(context.get("project_slug") or getattr(request, "project_slug", "default") or "default"),
                    operation=type(request).__name__,
                    resource_id=res_id[:150],
                    succeeded=not result.is_error,
                    latency_ms=lat,
                    client_ip=str(context.get("client_ip", "local")),
                    error_code=result.first_error.code if result.is_error else None,
                )
            except Exception:
                pass
        return result
