"""Response DTO for MCPQueryContextQuery."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class MCPQueryContextResponse:
    """Formatted markdown context and structured hits for MCP clients."""

    project_slug: str
    formatted_markdown: str
    hits: list[dict[str, Any]] = field(default_factory=list)

