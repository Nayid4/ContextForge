"""CreateDocument Command DTO."""

from __future__ import annotations

from dataclasses import dataclass

from application.common import ICommand
from domain.documents import DocumentAggregate


@dataclass(frozen=True)
class CreateDocumentCommand(ICommand[DocumentAggregate]):
    path: str
    title: str
    content_markdown: str
    module_name: str = "general"
    project_slug: str = "default"
    author: str = "system"
    tags: tuple[str, ...] = ()
    status: str = "published"
    summary: str = ""
