from __future__ import annotations
from application.projects.commands.CreateProject.CreateProjectCommand import CreateProjectCommand
from domain.common import DomainError

class CreateProjectCommandValidation:
    def validate(self, request: CreateProjectCommand) -> list[DomainError]:
        errs: list[DomainError] = []
        if len(request.name.strip()) < 2:
            errs.append(DomainError.validation("invalid_project_name", "El nombre del proyecto debe tener al menos 2 caracteres."))
        if not request.path.strip():
            errs.append(DomainError.validation("invalid_project_path", "La ruta documental del proyecto es obligatoria."))
        return errs
