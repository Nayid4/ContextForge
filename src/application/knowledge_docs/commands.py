"""Knowledge Docs Application Commands."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class IngestDocsCommand:
    """Command to scan, parse, chunk, and index all documents in docs directory."""

    target_directory: str = "./docs"
    project_slug: str | None = None


@dataclass(frozen=True)
class CreateDocumentCommand:
    """Command to create a new Markdown document in Docs-as-Code."""

    relative_path: str
    title: str
    module: str
    content_markdown: str
    project_slug: str = "default"
    author: str = "Equipo Técnico"
    tags: list[str] = field(default_factory=list)

