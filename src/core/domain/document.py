"""Document domain entities with multi-project isolation."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any
from domain.shared_kernel.entities import Entity


@dataclass(frozen=True)
class FrontmatterMetadata:
    """Metadata extracted from Markdown frontmatter with project isolation."""

    title: str = "Sin Título"
    module: str = "general"
    project_slug: str = "default"
    tags: list[str] = field(default_factory=list)
    author: str = "Equipo de Ingeniería"
    date: str = ""


@dataclass
class DocumentChunk(Entity):
    """Atomic fragment of a Markdown document with hierarchical context and project isolation."""

    project_slug: str = "default"
    document_path: str = ""
    header_hierarchy: list[str] = field(default_factory=list)
    header_level: str = "h2"
    text: str = ""
    token_count: int = 0
    module: str = "general"
    tags: list[str] = field(default_factory=list)
    source_type: str = "markdown"  # "markdown" | "attachment"
    parent_doc_path: str = ""
    attachment_name: str = ""
    location: str = ""

    def to_metadata_dict(self) -> dict[str, str]:
        """Format chunk metadata compliant with ContextForge Multi-Project Schema."""
        header_text = self.header_hierarchy[-1] if self.header_hierarchy else self.document_path.split("/")[-1]
        return {
            "project": self.project_slug,
            "module": self.module,
            "file_path": self.document_path,
            "title": header_text,
            "header_level": self.header_level,
            "tags": ",".join(self.tags),
            "source_type": self.source_type,
            "parent_doc_path": self.parent_doc_path or self.document_path,
            "attachment_name": self.attachment_name,
            "location": self.location or "Cuerpo",
        }



@dataclass
class Document(Entity):
    """Docs-as-Code Markdown Document Entity belonging to a specific Project."""

    project_slug: str = "default"
    path: str = ""
    title: str = ""
    module: str = "general"
    tags: list[str] = field(default_factory=list)
    content_markdown: str = ""
    author: str = "Equipo Técnico"
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    chunks: list[DocumentChunk] = field(default_factory=list)


@dataclass(frozen=True)
class RenderedMarkdown:
    """Rendered HTML representation of a Markdown document."""

    html_content: str
    raw_markdown: str
    word_count: int = 0
    reading_time_minutes: int = 0

