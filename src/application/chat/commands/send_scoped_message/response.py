"""SendScopedMessage response DTO."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class SendScopedMessageResponse:
    """Response DTO for SendScopedMessageCommand."""

    session_id: str
    message_id: str
    assistant_response: str
    sources: list[dict[str, Any]]
