from __future__ import annotations
from dataclasses import dataclass
from application.common import IQuery
from domain.common import PagedResult
from domain.ports import AuditLogRecord

@dataclass(frozen=True)
class ListAuditLogsQuery(IQuery[tuple[PagedResult[AuditLogRecord], bool]]):
    project_slug: str | None = None
    operation: str | None = None
    page: int = 1
    page_size: int = 25
