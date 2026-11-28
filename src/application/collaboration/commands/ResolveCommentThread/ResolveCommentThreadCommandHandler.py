from __future__ import annotations
from application.collaboration.commands.ResolveCommentThread.ResolveCommentThreadCommand import ResolveCommentThreadCommand
from domain.collaboration import DiscussionThreadEntity, ICollaborationRepositoryPort
from domain.common import DomainError, ErrorOr

class ResolveCommentThreadCommandHandler:
    def __init__(self, collab_repo: ICollaborationRepositoryPort) -> None:
        self._repo = collab_repo

    async def handle(self, request: ResolveCommentThreadCommand) -> ErrorOr[DiscussionThreadEntity]:
        updated = await self._repo.set_thread_resolved(request.thread_id, resolved=request.resolved)
        if updated is None:
            return ErrorOr.fail(DomainError.not_found("thread_not_found", f"Hilo '{request.thread_id}' no encontrado."))
        return ErrorOr.ok(updated)
