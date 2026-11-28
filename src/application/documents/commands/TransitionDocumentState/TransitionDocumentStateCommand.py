"""TransitionDocumentState Command DTO."""

from __future__ import annotations

from dataclasses import dataclass

from application.common import ICommand
from domain.documents import DocumentAggregate


@dataclass(frozen=True)
class TransitionDocumentStateCommand(ICommand[DocumentAggregate]):
    path: str
    target_status: str
    project_slug: str = "default"
    actor: str = "system"
    reason: str = ""
