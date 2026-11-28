from __future__ import annotations
from application.rag.queries.ListIndexingJobs.ListIndexingJobsQuery import ListIndexingJobsQuery
from domain.common import DomainError

class ListIndexingJobsQueryValidation:
    def validate(self, request: ListIndexingJobsQuery) -> list[DomainError]:
        return []
