from __future__ import annotations
from application.collaboration.queries.ListAuditLogs.ListAuditLogsQuery import ListAuditLogsQuery
from domain.common import DomainError

class ListAuditLogsQueryValidation:
    def validate(self, request: ListAuditLogsQuery) -> list[DomainError]:
        return []
