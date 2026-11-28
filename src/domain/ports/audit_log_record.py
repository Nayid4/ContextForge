"""Immutable tamper-evident audit log entry record (RF-COL-004, BR-14)."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass(frozen=True)
class AuditLogRecord:
    log_id: str
    actor_id: str
    role: str
    project_slug: str
    operation: str
    resource_id: str
    succeeded: bool
    latency_ms: float
    prev_hash: str
    entry_hash: str
    client_ip: str = "local"
    error_code: str | None = None
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
