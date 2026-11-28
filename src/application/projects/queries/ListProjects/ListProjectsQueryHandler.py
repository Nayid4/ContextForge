from __future__ import annotations
from application.projects.queries.ListProjects.ListProjectsQuery import ListProjectsQuery
from domain.common import ErrorOr
from domain.projects import IProjectRepositoryPort, ProjectEntity

class ListProjectsQueryHandler:
    def __init__(self, project_repo: IProjectRepositoryPort) -> None:
        self._repo = project_repo

    async def handle(self, request: ListProjectsQuery) -> ErrorOr[list[ProjectEntity]]:
        items = await self._repo.list_projects()
        return ErrorOr.ok(items)
