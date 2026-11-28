from __future__ import annotations
from dataclasses import dataclass
from application.common import ICommand

@dataclass(frozen=True)
class RetryDeadLetterJobsCommand(ICommand[int]):
    project_slug: str = "default"
