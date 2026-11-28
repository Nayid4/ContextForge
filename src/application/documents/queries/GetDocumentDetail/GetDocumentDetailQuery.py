"""GetDocumentDetail Query DTO."""

from __future__ import annotations

from dataclasses import dataclass

from application.common import IQuery
from domain.documents import DocumentAggregate


@dataclass(frozen=True)
class GetDocumentDetailQuery(IQuery[DocumentAggregate]):
    path: str
    project_slug: str = "default"
