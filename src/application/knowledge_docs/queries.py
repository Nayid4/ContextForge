"""Knowledge Docs Application Queries."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class GetDocumentsQuery:
    """Query to list documentation files, optionally by module or search keyword."""

    module: str | None = None
    search: str | None = None
    project_slug: str | None = None


@dataclass(frozen=True)
class GetDocumentDetailQuery:
    """Query to retrieve a single Markdown document by relative path."""

    relative_path: str
    project_slug: str | None = None

