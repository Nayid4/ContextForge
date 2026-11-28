from __future__ import annotations
from application.rag.queries.GetChatSessionHistory.GetChatSessionHistoryQuery import GetChatSessionHistoryQuery
from domain.common import DomainError

class GetChatSessionHistoryQueryValidation:
    def validate(self, request: GetChatSessionHistoryQuery) -> list[DomainError]:
        if not request.session_id.strip():
            return [DomainError.validation("empty_session_id", "session_id es obligatorio.")]
        return []
