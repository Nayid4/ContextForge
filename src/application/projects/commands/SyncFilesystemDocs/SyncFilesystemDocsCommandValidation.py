from __future__ import annotations
from application.projects.commands.SyncFilesystemDocs.SyncFilesystemDocsCommand import SyncFilesystemDocsCommand
from domain.common import DomainError

class SyncFilesystemDocsCommandValidation:
    def validate(self, request: SyncFilesystemDocsCommand) -> list[DomainError]:
        if not request.project_slug.strip():
            return [DomainError.validation("empty_project_slug", "project_slug es obligatorio.")]
        return []
