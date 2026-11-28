"""ContextForge Universal MCP Server Tools Registration using CQRS Mediator (BR-04, BR-10)."""

from __future__ import annotations

from application.bundles.queries.McpQueryContext import McpQueryContextQuery
from infrastructure.di import get_container
from presentation.mcp.fastmcp_engine import FastMCP
from presentation.mcp.mcp_tool_definition import MCPToolDefinition

mcp_server = FastMCP(
    name="ContextForge-Knowledge-Hub",
    instructions=(
        "Servidor central de documentación técnica, arquitectura y anexos del proyecto. "
        "Usa estas herramientas antes de proponer código para garantizar el cumplimiento de las reglas."
    ),
)


@mcp_server.tool()
async def search_project_context(query: str, project_slug: str = "default", top_k: int = 5) -> str:
    """Busca semántica y léxicamente en toda la documentación publicada del proyecto (BR-04)."""
    c = get_container()
    res = await c.mediator.send(
        McpQueryContextQuery(tool_name="search_project_context", query=query, project_slug=project_slug, top_k=top_k)
    )
    if not res.is_error and res.value:
        return str(res.value)
    return f"No se encontraron resultados publicados para '{query}' en el proyecto '{project_slug}'."


@mcp_server.tool()
async def get_document_full(doc_path: str, project_slug: str = "default") -> str:
    """Obtiene el contenido íntegro de un archivo Markdown publicado del proyecto."""
    c = get_container()
    doc = await c.doc_repo.get_by_path(doc_path, project_slug=project_slug)
    if doc is None or doc.status.value != "published":
        return f"Documento publicado '{doc_path}' no encontrado en el proyecto '{project_slug}'."
    return str(doc.content_markdown)


@mcp_server.tool()
async def list_project_structure(project_slug: str = "default") -> str:
    """Lista el árbol completo de documentos Markdown publicados disponibles en el proyecto."""
    c = get_container()
    docs = await c.doc_repo.list_all(project_slug=project_slug, only_published=True)
    if not docs:
        return f"El proyecto '{project_slug}' no contiene documentos publicados actualmente."
    lines = [f"# Estructura de Documentos — Proyecto `{project_slug}`\n"]
    for doc in sorted(docs, key=lambda d: d.path):
        lines.append(f"- `{doc.path}` — **{doc.title}** (`[{doc.module_name}]` v{doc.current_version})")
    return "\n".join(lines)


__all__ = ["FastMCP", "MCPToolDefinition", "get_document_full", "list_project_structure", "mcp_server", "search_project_context"]
