"""GetDocumentVersions Query DTO."""

from __future__ import annotations

from dataclasses import dataclass

from application.common import IQuery
from domain.documents import DocumentVersionEntity


@dataclass(frozen=True)
class GetDocumentVersionsQuery(IQuery[list[DocumentVersionEntity]]):
    path: str
    project_slug: str = "default"
