"""Lightweight Model Context Protocol (MCP) JSON-RPC 2.0 + SSE + STDIO Transport Engine with RBAC Scope Enforcement."""

from __future__ import annotations

import asyncio
import inspect
import json
import sys
from typing import Any, Callable, Coroutine
import uuid

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, StreamingResponse

from domain.common import DomainException
from domain.users import PermissionAction
from infrastructure.di import get_container
from presentation.api.dependencies.auth_guards import resolve_principal_from_headers
from presentation.mcp.mcp_tool_definition import MCPToolDefinition


class FastMCP:
    """Dependency-free Model Context Protocol Server supporting JSON-RPC (`/mcp/`), SSE (`/mcp/sse`), and STDIO."""

    def __init__(self, name: str, instructions: str = "") -> None:
        self.name = name
        self.instructions = instructions
        self._tools: dict[str, MCPToolDefinition] = {}
        self._sessions: dict[str, asyncio.Queue[dict[str, Any]]] = {}

    def tool(self) -> Callable[[Callable[..., Coroutine[Any, Any, str]]], Callable[..., Coroutine[Any, Any, str]]]:
        def decorator(func: Callable[..., Coroutine[Any, Any, str]]) -> Callable[..., Coroutine[Any, Any, str]]:
            sig = inspect.signature(func)
            doc = inspect.getdoc(func) or f"Execute {func.__name__}"
            properties: dict[str, Any] = {}
            required: list[str] = []

            for param_name, param in sig.parameters.items():
                ann = param.annotation
                json_type = (
                    "integer" if ann in (int, "int")
                    else "number" if ann in (float, "float")
                    else "boolean" if ann in (bool, "bool")
                    else "string"
                )
                prop_entry: dict[str, Any] = {"type": json_type}
                if param.default is not inspect.Parameter.empty:
                    prop_entry["default"] = param.default
                else:
                    required.append(param_name)
                properties[param_name] = prop_entry

            schema: dict[str, Any] = {"type": "object", "properties": properties}
            if required:
                schema["required"] = required
            self._tools[func.__name__] = MCPToolDefinition(func.__name__, doc, schema, func)
            return func

        return decorator

    def list_tools_metadata(self) -> list[dict[str, Any]]:
        return [{"name": t.name, "description": t.description, "inputSchema": t.input_schema} for t in self._tools.values()]

    async def handle_jsonrpc(self, payload: dict[str, Any]) -> dict[str, Any] | None:
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
                    "serverInfo": {"name": self.name, "version": "2.0.0"},
                    "capabilities": {"tools": {"listChanged": False}},
                    "instructions": self.instructions,
                },
            }
        if method == "ping":
            return {"jsonrpc": "2.0", "id": msg_id, "result": {}}
        if method == "tools/list":
            return {"jsonrpc": "2.0", "id": msg_id, "result": {"tools": self.list_tools_metadata()}}
        if method == "tools/call":
            tool_name = str(params.get("name", ""))
            tool_def = self._tools.get(tool_name)
            if tool_def is None:
                return {"jsonrpc": "2.0", "id": msg_id, "error": {"code": -32601, "message": f"MCP Tool '{tool_name}' not found."}}
            try:
                result_text = await tool_def.func(**(params.get("arguments") or {}))
                return {"jsonrpc": "2.0", "id": msg_id, "result": {"content": [{"type": "text", "text": str(result_text)}], "isError": False}}
            except Exception as exc:
                return {"jsonrpc": "2.0", "id": msg_id, "result": {"content": [{"type": "text", "text": f"Error executing '{tool_name}': {exc}"}], "isError": True}}
        return {"jsonrpc": "2.0", "id": msg_id, "error": {"code": -32601, "message": f"Method '{method}' not supported by {self.name}."}}

    async def _enforce_mcp_auth(self, request: Request, payload: dict[str, Any]) -> JSONResponse | None:
        container = get_container()
        try:
            principal = await resolve_principal_from_headers(request, container)
        except DomainException as exc:
            return JSONResponse(status_code=401, content={"detail": exc.error.message, "code": exc.error.code})

        params = payload.get("params") or {}
        args = params.get("arguments") or {}
        project_slug = str(args.get("project_slug") or "default")
        chk = principal.can_perform(PermissionAction.READ_KNOWLEDGE, project_slug=project_slug)
        if chk.is_error:
            return JSONResponse(
                status_code=403,
                media_type="application/problem+json",
                content={"title": "Forbidden", "status": 403, "detail": chk.first_error.message, "code": chk.first_error.code},
            )
        return None

    def sse_app(self) -> FastAPI:
        sub_app = FastAPI(title=f"{self.name} MCP Server", description=self.instructions, version="2.0.0")

        @sub_app.get("/info")
        async def mcp_info() -> dict[str, Any]:
            return {
                "name": self.name,
                "protocol": "mcp",
                "protocolVersion": "2024-11-05",
                "transports": ["jsonrpc", "sse", "stdio"],
                "endpoints": {"jsonrpc": "/mcp/", "sse": "/mcp/sse", "messages": "/mcp/messages"},
                "tools": self.list_tools_metadata(),
            }

        @sub_app.post("/")
        async def mcp_root_jsonrpc(request: Request) -> JSONResponse:
            payload = await request.json()
            denied = await self._enforce_mcp_auth(request, payload)
            if denied is not None:
                return denied
            response_msg = await self.handle_jsonrpc(payload)
            return JSONResponse({"status": "accepted"}, status_code=202) if response_msg is None else JSONResponse(response_msg, status_code=200)

        @sub_app.get("/sse")
        async def mcp_sse_endpoint(request: Request) -> StreamingResponse:
            session_id = uuid.uuid4().hex
            queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue()
            self._sessions[session_id] = queue
            messages_url = f"/mcp/messages?session_id={session_id}"

            async def event_generator() -> Any:
                try:
                    yield f"event: endpoint\ndata: {messages_url}\n\n"
                    while not await request.is_disconnected():
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
                headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
            )

        @sub_app.post("/messages")
        async def mcp_messages_endpoint(request: Request) -> JSONResponse:
            session_id = request.query_params.get("session_id", "")
            payload = await request.json()
            denied = await self._enforce_mcp_auth(request, payload)
            if denied is not None:
                return denied
            response_msg = await self.handle_jsonrpc(payload)
            if session_id and session_id in self._sessions and response_msg is not None:
                await self._sessions[session_id].put(response_msg)
            return JSONResponse({"status": "accepted"}, status_code=202) if response_msg is None else JSONResponse(response_msg, status_code=200)

        return sub_app

    def run(self, transport: str = "stdio") -> None:
        if transport != "stdio":
            raise ValueError(f"Unsupported standalone transport: {transport}")

        async def _stdio_loop() -> None:
            loop = asyncio.get_running_loop()
            reader = asyncio.StreamReader()
            await loop.connect_read_pipe(lambda: asyncio.StreamReaderProtocol(reader), sys.stdin)
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
