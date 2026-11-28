"""UpdateDocument Command DTO."""

from __future__ import annotations

from dataclasses import dataclass

from application.common import ICommand
from domain.documents import DocumentAggregate


@dataclass(frozen=True)
class UpdateDocumentCommand(ICommand[DocumentAggregate]):
    path: str
    title: str
    content_markdown: str
    module_name: str | None = None
    project_slug: str = "default"
    author: str = "system"
    tags: tuple[str, ...] | None = None
    summary: str | None = None
    expected_version: int | None = None
    is_locked: bool | None = None
    explicit_unlock: bool = False
    change_summary: str = "Actualización documental"
