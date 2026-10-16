"""ContextForge Universal MCP Server (FastMCP SSE & STDIO Transport).

Exposes project documentation, hybrid RAG search, and directory structures
as Model Context Protocol (MCP) tools consumable by Cursor, Claude Code CLI,
Antigravity, and any MCP-compatible host via SSE (`/mcp/sse`) or STDIO (`run_mcp.py`).
"""

from __future__ import annotations

import asyncio
import inspect
import json
import sys
import uuid
from dataclasses import dataclass
from typing import Any, Callable, Coroutine

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, StreamingResponse

from application.context_bridge.queries.mcp_query_context import (
    MCPQueryContextQuery,
    MCPQueryContextQueryHandler,
)
from presentation.api.dependencies import get_doc_repo, get_hybrid_searcher


@dataclass
class MCPToolDefinition:
    """Metadata and callable reference for a registered MCP tool."""

    name: str
    description: str
    input_schema: dict[str, Any]
    func: Callable[..., Coroutine[Any, Any, str]]


class FastMCP:
    """Lightweight, dependency-free Model Context Protocol (MCP) Server.

    Supports both:
    - ASGI/FastAPI SSE Sub-Application (`sse_app()`) mounted at `/mcp`
    - Standard I/O JSON-RPC 2.0 loop (`run(transport='stdio')`)
    """

    def __init__(self, name: str, instructions: str = "") -> None:
        self.name = name
        self.instructions = instructions
        self._tools: dict[str, MCPToolDefinition] = {}
        self._sessions: dict[str, asyncio.Queue[dict[str, Any]]] = {}

    def tool(self) -> Callable[[Callable[..., Coroutine[Any, Any, str]]], Callable[..., Coroutine[Any, Any, str]]]:
        """Decorator to register an async function as an MCP tool."""

        def decorator(func: Callable[..., Coroutine[Any, Any, str]]) -> Callable[..., Coroutine[Any, Any, str]]:
            sig = inspect.signature(func)
            doc = inspect.getdoc(func) or f"Execute {func.__name__}"
            properties: dict[str, Any] = {}
            required: list[str] = []

            for param_name, param in sig.parameters.items():
                annotation = param.annotation
                json_type = "string"
                if annotation in (int, "int"):
                    json_type = "integer"
                elif annotation in (float, "float"):
                    json_type = "number"
                elif annotation in (bool, "bool"):
                    json_type = "boolean"

                prop_entry: dict[str, Any] = {"type": json_type}
                if param.default is not inspect.Parameter.empty:
                    prop_entry["default"] = param.default
                else:
                    required.append(param_name)
                properties[param_name] = prop_entry

            schema: dict[str, Any] = {
                "type": "object",
                "properties": properties,
            }
            if required:
                schema["required"] = required

            self._tools[func.__name__] = MCPToolDefinition(
                name=func.__name__,
                description=doc,
                input_schema=schema,
                func=func,
            )
            return func

        return decorator

    def list_tools_metadata(self) -> list[dict[str, Any]]:
        """Return JSON-RPC MCP tool descriptors."""
        return [
            {
                "name": t.name,
                "description": t.description,
                "inputSchema": t.input_schema,
            }
            for t in self._tools.values()
        ]

    async def handle_jsonrpc(self, payload: dict[str, Any]) -> dict[str, Any] | None:
        """Process a single JSON-RPC 2.0 MCP message and return response dict."""
        msg_id = payload.get("id")
        method = str(payload.get("method", ""))
        params = payload.get("params") or {}

        if msg_id is None and method.startswith("notifications/"):
            return None

        if method == "initialize":
            return {
                "jsonrpc": "2.0",
                "id": msg_id,
                "result": {
                    "protocolVersion": "2024-11-05",
                    "serverInfo": {
                        "name": self.name,
                        "version": "1.0.0",
                    },
                    "capabilities": {
                        "tools": {"listChanged": False},
                    },
                    "instructions": self.instructions,
                },
            }

        if method == "ping":
            return {"jsonrpc": "2.0", "id": msg_id, "result": {}}

        if method == "tools/list":
            return {
                "jsonrpc": "2.0",
                "id": msg_id,
                "result": {
                    "tools": self.list_tools_metadata(),
                },
            }

        if method == "tools/call":
            tool_name = str(params.get("name", ""))
            arguments = params.get("arguments") or {}
            tool_def = self._tools.get(tool_name)
            if tool_def is None:
                return {
                    "jsonrpc": "2.0",
                    "id": msg_id,
                    "error": {
                        "code": -32601,
                        "message": f"MCP Tool '{tool_name}' not found.",
                    },
                }
            try:
                result_text = await tool_def.func(**arguments)
                return {
                    "jsonrpc": "2.0",
                    "id": msg_id,
                    "result": {
                        "content": [
                            {
                                "type": "text",
                                "text": str(result_text),
                            }
                        ],
                        "isError": False,
                    },
                }
            except Exception as exc:
                return {
                    "jsonrpc": "2.0",
                    "id": msg_id,
                    "result": {
                        "content": [
                            {
                                "type": "text",
                                "text": f"Error executing '{tool_name}': {exc}",
                            }
                        ],
                        "isError": True,
                    },
                }

        return {
            "jsonrpc": "2.0",
            "id": msg_id,
            "error": {
                "code": -32601,
                "message": f"Method '{method}' not supported by {self.name}.",
            },
        }

    def sse_app(self) -> FastAPI:
        """Create a FastAPI sub-application exposing MCP over SSE and HTTP POST."""
        sub_app = FastAPI(
            title=f"{self.name} MCP Server",
            description=self.instructions,
            version="1.0.0",
        )

        @sub_app.get("/info")
        async def mcp_info() -> dict[str, Any]:
            return {
                "name": self.name,
                "protocol": "mcp",
                "protocolVersion": "2024-11-05",
                "transports": ["sse", "stdio"],
                "endpoints": {
                    "sse": "/mcp/sse",
                    "messages": "/mcp/messages",
                },
                "tools": self.list_tools_metadata(),
            }

        @sub_app.get("/sse")
        async def mcp_sse_endpoint(request: Request) -> StreamingResponse:
            session_id = uuid.uuid4().hex
            queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue()
            self._sessions[session_id] = queue

            messages_url = f"/mcp/messages?session_id={session_id}"

            async def event_generator() -> Any:
                try:
                    yield f"event: endpoint\ndata: {messages_url}\n\n"
                    while True:
                        if await request.is_disconnected():
                            break
                        try:
                            msg = await asyncio.wait_for(queue.get(), timeout=15.0)
                            yield f"event: message\ndata: {json.dumps(msg, ensure_ascii=False)}\n\n"
                        except asyncio.TimeoutError:
                            yield ": keepalive\n\n"
                finally:
                    self._sessions.pop(session_id, None)

            return StreamingResponse(
                event_generator(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "X-Accel-Buffering": "no",
                },
            )

        @sub_app.post("/messages")
        async def mcp_messages_endpoint(request: Request) -> JSONResponse:
            session_id = request.query_params.get("session_id", "")
            payload = await request.json()
            response_msg = await self.handle_jsonrpc(payload)

            if session_id and session_id in self._sessions and response_msg is not None:
                await self._sessions[session_id].put(response_msg)

            if response_msg is None:
                return JSONResponse({"status": "accepted"}, status_code=202)
            return JSONResponse(response_msg, status_code=200)

        return sub_app

    def run(self, transport: str = "stdio") -> None:
        """Run the MCP server over STDIO for local spawns (`python run_mcp.py`)."""
        if transport != "stdio":
            raise ValueError(f"Unsupported standalone transport: {transport}")

        async def _stdio_loop() -> None:
            loop = asyncio.get_running_loop()
            reader = asyncio.StreamReader()
            protocol = asyncio.StreamReaderProtocol(reader)
            await loop.connect_read_pipe(lambda: protocol, sys.stdin)

            while True:
                line_bytes = await reader.readline()
                if not line_bytes:
                    break
                line_str = line_bytes.decode("utf-8", errors="replace").strip()
                if not line_str:
                    continue
                try:
                    payload = json.loads(line_str)
                except json.JSONDecodeError:
                    continue

                response = await self.handle_jsonrpc(payload)
                if response is not None:
                    sys.stdout.write(json.dumps(response, ensure_ascii=False) + "\n")
                    sys.stdout.flush()

        asyncio.run(_stdio_loop())


# Instanciar servidor MCP oficial de ContextForge
mcp_server = FastMCP(
    name="ContextForge-Knowledge-Hub",
    instructions=(
        "Servidor central de documentación técnica, arquitectura y anexos del proyecto. "
        "Usa estas herramientas antes de proponer código para garantizar el cumplimiento de las reglas."
    ),
)


@mcp_server.tool()
async def search_project_context(
    query: str,
    project_slug: str = "default",
    top_k: int = 5,
) -> str:
    """Busca semántica y léxicamente en toda la documentación Markdown y anexos del proyecto."""
    try:
        searcher = get_hybrid_searcher()
        handler = MCPQueryContextQueryHandler(hybrid_searcher=searcher)
        mcp_res = await handler.handle(
            MCPQueryContextQuery(
                project_slug=project_slug,
                query=query,
                limit=top_k,
            )
        )
        if mcp_res.hits:
            return mcp_res.formatted_markdown
    except Exception:
        pass

    doc_repo = get_doc_repo()
    docs = await doc_repo.list_all(project_slug=project_slug)
    if not docs:
        return f"No se encontraron documentos en el proyecto '{project_slug}'."

    q_lower = query.lower()
    matched_sections: list[str] = []
    for doc in docs:
        if q_lower in doc.content_markdown.lower() or q_lower in doc.title.lower():
            snippet = doc.content_markdown[:1200]
            matched_sections.append(
                f"#### `{doc.path}` ({doc.title})\n{snippet}"
            )
            if len(matched_sections) >= top_k:
                break

    if matched_sections:
        return "\n\n---\n\n".join(matched_sections)

    return "\n\n---\n\n".join(
        f"#### `{doc.path}` ({doc.title})\n{doc.content_markdown[:800]}"
        for doc in docs[:top_k]
    )


@mcp_server.tool()
async def get_document_full(
    doc_path: str,
    project_slug: str = "default",
) -> str:
    """Obtiene el contenido íntegro de un archivo Markdown específico del proyecto."""
    doc_repo = get_doc_repo()
    doc = await doc_repo.get_by_path(doc_path, project_slug=project_slug)
    if doc is None:
        return f"Documento '{doc_path}' no encontrado en el proyecto '{project_slug}'."
    return str(doc.content_markdown)


@mcp_server.tool()
async def list_project_structure(project_slug: str = "default") -> str:
    """Lista el árbol completo de documentos Markdown y anexos disponibles en el proyecto."""
    doc_repo = get_doc_repo()
    docs = await doc_repo.list_all(project_slug=project_slug)
    if not docs:
        return f"El proyecto '{project_slug}' no contiene documentos actualmente."

    lines = [f"# Estructura de Documentos — Proyecto `{project_slug}`\n"]
    for doc in sorted(docs, key=lambda d: d.path):
        lines.append(f"- `{doc.path}` — **{doc.title}** (`[{doc.module}]`)")
    return "\n".join(lines)

