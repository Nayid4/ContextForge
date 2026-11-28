from __future__ import annotations
from dataclasses import dataclass
from application.common import ICommand
from domain.projects import SyncSummaryVO

@dataclass(frozen=True)
class SyncFilesystemDocsCommand(ICommand[SyncSummaryVO]):
    project_slug: str = "default"
    target_directory: str | None = None
