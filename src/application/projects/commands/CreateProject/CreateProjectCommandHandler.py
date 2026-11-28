from __future__ import annotations
from pathlib import Path
from application.projects.commands.CreateProject.CreateProjectCommand import CreateProjectCommand
from domain.common import DomainError, ErrorOr
from domain.projects import IProjectRepositoryPort, ProjectEntity

class CreateProjectCommandHandler:
    def __init__(self, project_repo: IProjectRepositoryPort) -> None:
        self._repo = project_repo

    async def handle(self, request: CreateProjectCommand) -> ErrorOr[ProjectEntity]:
        created = ProjectEntity.create(
            name=request.name,
            slug=request.slug,
            path=request.path,
            description=request.description,
            sovereign_only=request.sovereign_only,
            max_quota_mb=request.max_quota_mb,
            owner_id=request.owner_id,
        )
        if created.is_error:
            return created
        proj = created.value
        existing = await self._repo.get_by_slug(proj.slug)
        if existing is not None:
            return ErrorOr.fail(DomainError.conflict("duplicate_project_slug", f"Ya existe un proyecto con el slug '{proj.slug}' (BR-01)."))
        Path(proj.path).mkdir(parents=True, exist_ok=True)
        saved = await self._repo.save(proj)
        return ErrorOr.ok(saved)
