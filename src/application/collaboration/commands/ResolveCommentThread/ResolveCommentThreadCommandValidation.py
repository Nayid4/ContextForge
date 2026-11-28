from __future__ import annotations
from application.collaboration.commands.ResolveCommentThread.ResolveCommentThreadCommand import ResolveCommentThreadCommand
from domain.common import DomainError

class ResolveCommentThreadCommandValidation:
    def validate(self, request: ResolveCommentThreadCommand) -> list[DomainError]:
        if not request.thread_id.strip():
            return [DomainError.validation("empty_thread_id", "thread_id es obligatorio.")]
        return []
