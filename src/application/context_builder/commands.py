"""Context Builder Application Commands."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class BuildContextBundleCommand:
    """Command to compile a context bundle for specified modules."""

    modules: list[str] = field(default_factory=list)
    max_tokens: int = 16000
    include_toc: bool = True
    include_guidelines: bool = True
    project_slug: str | None = None
    export_format: str = "markdown"  # "markdown" or "cursorrules"


