"""Real-time notification port decoupling Domain/Application from WebSockets."""

from __future__ import annotations

from typing import Any, Protocol


class IRealtimeNotifier(Protocol):
    async def broadcast_project_event(
        self,
        project_slug: str,
        event_type: str,
        payload: dict[str, Any],
        *,
        doc_path: str | None = None,
    ) -> int: ...
