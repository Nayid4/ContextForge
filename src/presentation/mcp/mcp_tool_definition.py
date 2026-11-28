"""Metadata and callable reference for a registered MCP tool."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Coroutine


@dataclass
class MCPToolDefinition:
    name: str
    description: str
    input_schema: dict[str, Any]
    func: Callable[..., Coroutine[Any, Any, str]]
