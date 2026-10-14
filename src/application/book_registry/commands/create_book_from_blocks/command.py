"""CreateBookFromBlocks command definition."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class CreateBookFromBlocksCommand:
    """Command to compile visual blocks into Markdown and persist to sovereign disk."""

    library_id: str
    module: str
    title: str
    description: str = ""
    tags: list[str] = field(default_factory=list)
    blocks: list[dict[str, Any]] = field(default_factory=list)
    doc_name: str = ""

