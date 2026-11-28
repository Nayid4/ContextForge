from __future__ import annotations
from application.rag.commands.RetryDeadLetterJobs.RetryDeadLetterJobsCommand import RetryDeadLetterJobsCommand
from domain.common import DomainError

class RetryDeadLetterJobsCommandValidation:
    def validate(self, request: RetryDeadLetterJobsCommand) -> list[DomainError]:
        return []
