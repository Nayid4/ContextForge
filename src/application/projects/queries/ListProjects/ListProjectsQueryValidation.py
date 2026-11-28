from __future__ import annotations
from application.projects.queries.ListProjects.ListProjectsQuery import ListProjectsQuery
from domain.common import DomainError

class ListProjectsQueryValidation:
    def validate(self, request: ListProjectsQuery) -> list[DomainError]:
        return []
