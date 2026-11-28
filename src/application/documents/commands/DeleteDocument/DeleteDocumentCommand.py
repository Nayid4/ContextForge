from __future__ import annotations
from dataclasses import dataclass
from application.common import ICommand

@dataclass(frozen=True)
class DeleteDocumentCommand(ICommand[bool]):
    path: str
    project_slug: str = "default"
