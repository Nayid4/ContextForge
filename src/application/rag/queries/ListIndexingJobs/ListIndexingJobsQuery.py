from __future__ import annotations
from dataclasses import dataclass
from application.common import IQuery
from domain.rag import IndexingJobEntity

@dataclass(frozen=True)
class ListIndexingJobsQuery(IQuery[list[IndexingJobEntity]]):
    project_slug: str | None = None
    status: str | None = None
