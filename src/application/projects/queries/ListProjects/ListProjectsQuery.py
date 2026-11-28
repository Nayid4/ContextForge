from __future__ import annotations
from dataclasses import dataclass
from application.common import IQuery
from domain.projects import ProjectEntity

@dataclass(frozen=True)
class ListProjectsQuery(IQuery[list[ProjectEntity]]):
    include_inactive: bool = True
