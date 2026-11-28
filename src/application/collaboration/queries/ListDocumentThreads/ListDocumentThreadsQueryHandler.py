from __future__ import annotations
from application.collaboration.queries.ListDocumentThreads.ListDocumentThreadsQuery import ListDocumentThreadsQuery
from domain.collaboration import DiscussionThreadEntity, ICollaborationRepositoryPort
from domain.common import ErrorOr

class ListDocumentThreadsQueryHandler:
    def __init__(self, collab_repo: ICollaborationRepositoryPort) -> None:
        self._repo = collab_repo

    async def handle(self, request: ListDocumentThreadsQuery) -> ErrorOr[list[DiscussionThreadEntity]]:
        book_id = f"{request.project_slug}:{request.doc_path.strip()}"
        threads = await self._repo.list_threads(book_id=book_id, project_slug=request.project_slug)
        return ErrorOr.ok(threads)
