"""ListDocumentsPaginated Query DTO."""

from __future__ import annotations

from dataclasses import dataclass

from application.common import IQuery
from domain.common import PagedResult
from domain.documents import DocumentAggregate


@dataclass(frozen=True)
class ListDocumentsPaginatedQuery(IQuery[PagedResult[DocumentAggregate]]):
    project_slug: str = "default"
    module_name: str | None = None
    status: str | None = None
    search: str | None = None
    page: int = 1
    page_size: int = 12
