from __future__ import annotations
from application.collaboration.commands.RateDocument.RateDocumentCommand import RateDocumentCommand
from domain.collaboration import ICollaborationRepositoryPort, RatingSummaryVO
from domain.common import ErrorOr

class RateDocumentCommandHandler:
    def __init__(self, collab_repo: ICollaborationRepositoryPort) -> None:
        self._repo = collab_repo

    async def handle(self, request: RateDocumentCommand) -> ErrorOr[RatingSummaryVO]:
        book_id = f"{request.project_slug}:{request.doc_path.strip()}"
        summary = await self._repo.upsert_rating(
            book_id=book_id,
            project_slug=request.project_slug,
            user_identifier=request.user_identifier.strip() or "anonymous",
            score=request.score,
        )
        return ErrorOr.ok(summary)
