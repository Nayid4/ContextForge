from __future__ import annotations
from dataclasses import dataclass
from application.common import ICommand
from domain.projects import ProjectEntity

@dataclass(frozen=True)
class CreateProjectCommand(ICommand[ProjectEntity]):
    name: str
    slug: str | None = None
    path: str = "./docs"
    description: str = ""
    sovereign_only: bool = False
    max_quota_mb: int = 1024
    owner_id: str | None = None
