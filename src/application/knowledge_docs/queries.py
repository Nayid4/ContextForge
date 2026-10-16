"""Knowledge Docs Application Queries."""

from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from domain.knowledge_docs.entities import Document


@dataclass(frozen=True)
class GetDocumentsQuery:
    """Query to list documentation files, optionally by module or search keyword."""

    module: str | None = None
    search: str | None = None
    project_slug: str | None = None


@dataclass(frozen=True)
class GetDocumentsPagedQuery:
    """Query to list documentation files with dynamic server-side pagination."""

    module: str | None = None
    search: str | None = None
    project_slug: str | None = None
    page: int = 1
    per_page: int = 9


@dataclass(frozen=True)
class PagedDocumentsResult:
    """Result containing paginated items and calculated pagination metadata."""

    items: list[Document]
    total_count: int
    page: int
    per_page: int
    total_pages: int
    has_prev: bool
    has_next: bool


@dataclass(frozen=True)
class GetDocumentDetailQuery:
    """Query to retrieve a single Markdown document by relative path."""

    relative_path: str
    project_slug: str | None = None

