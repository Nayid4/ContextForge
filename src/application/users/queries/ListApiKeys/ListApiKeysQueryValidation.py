from __future__ import annotations
from application.users.queries.ListApiKeys.ListApiKeysQuery import ListApiKeysQuery
from domain.common import DomainError

class ListApiKeysQueryValidation:
    def validate(self, request: ListApiKeysQuery) -> list[DomainError]:
        return []
