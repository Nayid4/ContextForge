from __future__ import annotations
from dataclasses import dataclass
from application.common import IQuery
from domain.documents import DiffComparisonVO

@dataclass(frozen=True)
class CompareDocumentVersionsQuery(IQuery[DiffComparisonVO]):
    path: str
    from_version: int
    to_version: int
    project_slug: str = "default"
