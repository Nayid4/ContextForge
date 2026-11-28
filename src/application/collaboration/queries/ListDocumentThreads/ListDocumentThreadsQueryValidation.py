from __future__ import annotations
from application.collaboration.queries.ListDocumentThreads.ListDocumentThreadsQuery import ListDocumentThreadsQuery
from domain.common import DomainError

class ListDocumentThreadsQueryValidation:
    def validate(self, request: ListDocumentThreadsQuery) -> list[DomainError]:
        return []
