"""Query for MCP context retrieval."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class MCPQueryContextQuery:
    """Query executed by MCP Server tools to search project knowledge."""

    project_slug: str = "default"
    query: str = ""
    module_filter: str | None = None
    limit: int = 5

