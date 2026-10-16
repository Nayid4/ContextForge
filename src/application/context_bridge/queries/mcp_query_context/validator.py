"""Validator for MCPQueryContextQuery."""

from __future__ import annotations

from application.commons.exceptions import ValidationException
from application.context_bridge.queries.mcp_query_context.query import MCPQueryContextQuery


class MCPQueryContextValidator:
    """Validates MCPQueryContextQuery."""

    @staticmethod
    def validate(query: MCPQueryContextQuery) -> None:
        if not query.query or not query.query.strip():
            raise ValidationException("El término de búsqueda MCP no puede estar vacío.")

