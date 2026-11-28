from __future__ import annotations
from application.users.queries.GetSystemHealthKpis.GetSystemHealthKpisQuery import GetSystemHealthKpisQuery
from domain.common import DomainError

class GetSystemHealthKpisQueryValidation:
    def validate(self, request: GetSystemHealthKpisQuery) -> list[DomainError]:
        return []
