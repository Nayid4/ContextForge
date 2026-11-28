from __future__ import annotations
from typing import Any, Callable, Coroutine
from application.rag.commands.RetryDeadLetterJobs.RetryDeadLetterJobsCommand import RetryDeadLetterJobsCommand
from domain.common import ErrorOr
from domain.documents import DocumentAggregate, IDocumentRepositoryPort
from domain.rag import IIndexingJobRepositoryPort, IndexingJobStatus

class RetryDeadLetterJobsCommandHandler:
    def __init__(
        self,
        job_repo: IIndexingJobRepositoryPort,
        doc_repo: IDocumentRepositoryPort,
        index_callback: Callable[[DocumentAggregate], Coroutine[Any, Any, Any]],
    ) -> None:
        self._jobs = job_repo
        self._docs = doc_repo
        self._index_callback = index_callback

    async def handle(self, request: RetryDeadLetterJobsCommand) -> ErrorOr[int]:
        dlq = await self._jobs.list_jobs(project_slug=request.project_slug, status=IndexingJobStatus.DEAD_LETTER)
        retried = 0
        for job in dlq:
            doc = await self._docs.get_by_id(job.book_id)
            if doc is not None:
                await self._index_callback(doc)
                retried += 1
        return ErrorOr.ok(retried)
