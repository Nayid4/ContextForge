from __future__ import annotations
from application.projects.queries.ListTaxonomyItems.ListTaxonomyItemsQuery import ListTaxonomyItemsQuery
from domain.common import DomainError

class ListTaxonomyItemsQueryValidation:
    def validate(self, request: ListTaxonomyItemsQuery) -> list[DomainError]:
        return []
