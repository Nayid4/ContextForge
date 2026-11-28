from __future__ import annotations
from application.collaboration.queries.ListAuditLogs.ListAuditLogsQuery import ListAuditLogsQuery
from domain.common import ErrorOr, PagedResult, PageParams
from domain.ports import AuditLogRecord, IEventStore

class ListAuditLogsQueryHandler:
    def __init__(self, event_store: IEventStore) -> None:
        self._store = event_store

    async def handle(self, request: ListAuditLogsQuery) -> ErrorOr[tuple[PagedResult[AuditLogRecord], bool]]:
        paged = await self._store.list_audit_logs(
            project_slug=request.project_slug,
            operation=request.operation,
            pagination=PageParams(request.page, request.page_size),
        )
        chain_valid = await self._store.verify_chain_integrity()
        return ErrorOr.ok((paged, chain_valid))
