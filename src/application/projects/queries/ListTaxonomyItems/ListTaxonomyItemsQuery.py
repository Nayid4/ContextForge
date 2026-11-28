from __future__ import annotations
from dataclasses import dataclass
from application.common import IQuery
from domain.projects import TaxonomyItemEntity

@dataclass(frozen=True)
class ListTaxonomyItemsQuery(IQuery[list[TaxonomyItemEntity]]):
    project_slug: str = "default"
    kind: str | None = None
    search: str | None = None
