from __future__ import annotations
from application.users.queries.ListLlmProviders.ListLlmProvidersQuery import ListLlmProvidersQuery
from domain.common import DomainError

class ListLlmProvidersQueryValidation:
    def validate(self, request: ListLlmProvidersQuery) -> list[DomainError]:
        return []
