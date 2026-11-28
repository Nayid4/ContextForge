"""WebSocket Connection Manager for real-time project presence and collaborative events (IRealtimeNotifier)."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from fastapi import WebSocket

from domain.ports import IRealtimeNotifier


class WebSocketConnectionManager(IRealtimeNotifier):
    def __init__(self) -> None:
        self._connections: dict[WebSocket, dict[str, str]] = {}

    async def connect(
        self,
        websocket: WebSocket,
        *,
        project_slug: str = "default",
        user_name: str = "Colaborador",
        doc_path: str = "",
    ) -> None:
        await websocket.accept()
        self._connections[websocket] = {
            "project_slug": project_slug,
            "user_name": user_name,
            "doc_path": doc_path,
            "state": "viewing",
            "connected_at": datetime.now(timezone.utc).isoformat(),
        }
        await self._broadcast_presence(project_slug)

    async def disconnect(self, websocket: WebSocket) -> None:
        meta = self._connections.pop(websocket, None)
        if meta is not None:
            await self._broadcast_presence(meta["project_slug"])

    async def update_presence(self, websocket: WebSocket, *, action: str, doc_path: str = "") -> None:
        meta = self._connections.get(websocket)
        if meta is None:
            return
        if doc_path:
            meta["doc_path"] = doc_path
        if action == "editing_start":
            meta["state"] = "editing"
        elif action == "editing_stop":
            meta["state"] = "viewing"
        await self._broadcast_presence(meta["project_slug"])

    async def broadcast_project_event(
        self,
        project_slug: str,
        event_type: str,
        payload: dict[str, Any],
        *,
        doc_path: str | None = None,
    ) -> int:
        message = {
            "event": event_type,
            "project": project_slug,
            "doc_path": doc_path or "",
            "data": payload,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        delivered = 0
        stale: list[WebSocket] = []
        for ws, meta in list(self._connections.items()):
            if meta["project_slug"] != project_slug:
                continue
            try:
                await ws.send_json(message)
                delivered += 1
            except Exception:
                stale.append(ws)
        for ws in stale:
            self._connections.pop(ws, None)
        return delivered

    async def _broadcast_presence(self, project_slug: str) -> None:
        peers = [
            {
                "user": meta["user_name"],
                "doc_path": meta["doc_path"],
                "state": meta["state"],
            }
            for meta in self._connections.values()
            if meta["project_slug"] == project_slug
        ]
        message = {
            "event": "presence.sync",
            "project": project_slug,
            "count": len(peers),
            "peers": peers,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        stale: list[WebSocket] = []
        for ws, meta in list(self._connections.items()):
            if meta["project_slug"] != project_slug:
                continue
            try:
                await ws.send_json(message)
            except Exception:
                stale.append(ws)
        for ws in stale:
            self._connections.pop(ws, None)
