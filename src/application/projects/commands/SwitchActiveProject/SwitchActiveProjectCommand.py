from __future__ import annotations
from dataclasses import dataclass
from application.common import ICommand
from domain.projects import ProjectEntity

@dataclass(frozen=True)
class SwitchActiveProjectCommand(ICommand[ProjectEntity]):
    project_slug: str
