from __future__ import annotations
from application.rag.queries.ListIndexingJobs.ListIndexingJobsQuery import ListIndexingJobsQuery
from domain.common import ErrorOr
from domain.rag import IIndexingJobRepositoryPort, IndexingJobEntity, IndexingJobStatus

class ListIndexingJobsQueryHandler:
    def __init__(self, job_repo: IIndexingJobRepositoryPort) -> None:
        self._repo = job_repo

    async def handle(self, request: ListIndexingJobsQuery) -> ErrorOr[list[IndexingJobEntity]]:
        st: IndexingJobStatus | None = None
        if request.status:
            for member in IndexingJobStatus:
                if member.value.lower() == request.status.lower():
                    st = member
                    break
        jobs = await self._repo.list_jobs(project_slug=request.project_slug, status=st)
        return ErrorOr.ok(jobs)
