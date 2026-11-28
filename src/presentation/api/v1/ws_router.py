from __future__ import annotations
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from infrastructure.di import get_container

router = APIRouter(tags=["Realtime WebSockets"])

@router.websocket("/ws/collaboration")
async def ws_collaboration(
    websocket: WebSocket,
    project: str = "default",
    user: str = "Colaborador",
    doc_path: str = "",
) -> None:
    mgr = get_container().ws_manager
    await mgr.connect(websocket, project_slug=project, user_name=user, doc_path=doc_path)
    try:
        while True:
            msg = await websocket.receive_json()
            action = str(msg.get("action", "ping"))
            if action == "ping":
                await websocket.send_json({"event": "pong"})
            elif action in ("editing_start", "editing_stop", "subscribe"):
                await mgr.update_presence(websocket, action=action, doc_path=str(msg.get("doc_path", doc_path)))
    except WebSocketDisconnect:
        await mgr.disconnect(websocket)
    except Exception:
        await mgr.disconnect(websocket)
