"""Handler for MCPQueryContextQuery."""

from __future__ import annotations

from typing import Any
from application.context_bridge.queries.mcp_query_context.query import MCPQueryContextQuery
from application.context_bridge.queries.mcp_query_context.response import MCPQueryContextResponse
from application.context_bridge.queries.mcp_query_context.validator import MCPQueryContextValidator
from application.rag_engine.services.hybrid_searcher import HybridSearchService


class MCPQueryContextQueryHandler:
    """Executes hybrid RAG search for MCP tools and formats results into clean Markdown."""

    def __init__(self, hybrid_searcher: HybridSearchService) -> None:
        self._searcher = hybrid_searcher

    async def handle(self, query: MCPQueryContextQuery) -> MCPQueryContextResponse:
        MCPQueryContextValidator.validate(query)
        slug = query.project_slug.strip() or "default"

        results = await self._searcher.search(
            query=query.query,
            project_slug=slug,
            top_k=query.limit,
        )

        if query.module_filter:
            mod_clean = query.module_filter.strip().lower()
            filtered = [r for r in results if mod_clean in r.file_path.lower()]
            if filtered:
                results = filtered

        if not results:
            return MCPQueryContextResponse(
                project_slug=slug,
                formatted_markdown=(
                    f"No se encontró documentación relevante en '{slug}' para: '{query.query}'."
                ),
                hits=[],
            )

        output = [f"### Fragmentos relevantes de ContextForge [{slug}]:\n"]
        hits_list: list[dict[str, Any]] = []
        for r in results:
            header_label = " > ".join(r.header_hierarchy) if r.header_hierarchy else ""
            title = header_label or r.file_path
            loc = header_label or "Cuerpo"
            output.append(
                f"**Archivo:** `{r.file_path}` ({title} - {loc})\n```markdown\n{r.text}\n```\n"
            )
            hits_list.append(
                {
                    "chunk_id": r.chunk_id,
                    "file_path": r.file_path,
                    "title": title,
                    "location": loc,
                    "text": r.text,
                    "score": r.relevance_score,
                }
            )

        return MCPQueryContextResponse(
            project_slug=slug,
            formatted_markdown="\n".join(output),
            hits=hits_list,
        )

