"""DiscoverCliEngines Query Validator."""

from __future__ import annotations

from application.users.queries.DiscoverCliEngines.DiscoverCliEnginesQuery import DiscoverCliEnginesQuery
from domain.common import DomainError


class DiscoverCliEnginesQueryValidation:
    def validate(self, request: DiscoverCliEnginesQuery) -> list[DomainError]:
        return []
