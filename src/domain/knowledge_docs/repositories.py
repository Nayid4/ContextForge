"""Knowledge Docs Domain Repository Interface."""

from __future__ import annotations

from typing import Protocol
from domain.knowledge_docs.entities import Document


class IDocumentRepository(Protocol):
    """Protocol for scanning, reading and saving Markdown documents."""

    async def list_all(
        self,
        module: str | None = None,
        search: str | None = None,
        project_slug: str | None = None,
    ) -> list[Document]:
        ...

    async def get_by_path(
        self,
        relative_path: str,
        project_slug: str | None = None,
    ) -> Document | None:
        ...

    async def save_document(
        self,
        relative_path: str,
        content: str,
        project_slug: str | None = None,
    ) -> Document:
        ...

