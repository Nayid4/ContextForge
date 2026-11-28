from __future__ import annotations
from application.projects.commands.SwitchActiveProject.SwitchActiveProjectCommand import SwitchActiveProjectCommand
from domain.common import DomainError

class SwitchActiveProjectCommandValidation:
    def validate(self, request: SwitchActiveProjectCommand) -> list[DomainError]:
        if not request.project_slug.strip():
            return [DomainError.validation("empty_project_slug", "Debe especificar project_slug.")]
        return []
