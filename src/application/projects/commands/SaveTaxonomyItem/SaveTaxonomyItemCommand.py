from __future__ import annotations
from dataclasses import dataclass
from application.common import ICommand
from domain.projects import TaxonomyItemEntity

@dataclass(frozen=True)
class SaveTaxonomyItemCommand(ICommand[TaxonomyItemEntity]):
    project_slug: str
    kind: str
    name: str
    slug: str | None = None
    description: str = ""
    color: str = "indigo"
    icon: str = "folder"
