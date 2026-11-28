from __future__ import annotations
from dataclasses import dataclass
from application.common import ICommand
from domain.documents import DocumentAggregate

@dataclass(frozen=True)
class RollbackDocumentVersionCommand(ICommand[DocumentAggregate]):
    path: str
    target_version: int
    reason: str
    project_slug: str = "default"
    actor: str = "curator"
