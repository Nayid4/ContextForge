"""Append-only cryptographic audit event store port."""

from __future__ import annotations

from typing import Protocol

from domain.common import PagedResult, PageParams
from domain.ports.audit_log_record import AuditLogRecord


class IEventStore(Protocol):
    async def append_audit(
        self,
        *,
        actor_id: str,
        role: str,
        project_slug: str,
        operation: str,
        resource_id: str,
        succeeded: bool,
        latency_ms: float,
        client_ip: str = "local",
        error_code: str | None = None,
    ) -> AuditLogRecord: ...

    async def list_audit_logs(
        self,
        *,
        project_slug: str | None = None,
        operation: str | None = None,
        pagination: PageParams = PageParams(),
    ) -> PagedResult[AuditLogRecord]: ...

    async def verify_chain_integrity(self) -> bool: ...
