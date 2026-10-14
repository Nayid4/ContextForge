"""Context Builder Domain Entities."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from domain.shared_kernel.entities import Entity


@dataclass(frozen=True)
class BundleSpecification:
    """Parameters for compiling a context bundle for AI assistants."""

    modules: list[str]
    max_tokens: int = 16000
    include_toc: bool = True
    include_guidelines: bool = True
    export_format: str = "markdown"  # "markdown" or "cursorrules"
    project_slug: str = "default"



@dataclass
class ContextBundle(Entity):
    """Assembled Markdown context bundle optimized for Cursor, Copilot, Windsurf."""

    title: str = ""
    modules: list[str] = field(default_factory=list)
    compiled_markdown: str = ""
    token_count: int = 0
    file_path: str = ""
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

