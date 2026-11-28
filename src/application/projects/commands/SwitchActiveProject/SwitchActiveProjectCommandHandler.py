from __future__ import annotations
from application.projects.commands.SwitchActiveProject.SwitchActiveProjectCommand import SwitchActiveProjectCommand
from domain.common import DomainError, ErrorOr
from domain.projects import IProjectRepositoryPort, ProjectEntity

class SwitchActiveProjectCommandHandler:
    def __init__(self, project_repo: IProjectRepositoryPort) -> None:
        self._repo = project_repo

    async def handle(self, request: SwitchActiveProjectCommand) -> ErrorOr[ProjectEntity]:
        updated = await self._repo.set_active(request.project_slug.strip())
        if updated is None:
            return ErrorOr.fail(DomainError.not_found("project_not_found", f"Proyecto '{request.project_slug}' no encontrado."))
        return ErrorOr.ok(updated)
