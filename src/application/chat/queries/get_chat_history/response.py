"""GetChatHistory response DTO."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class GetChatHistoryResponse:
    """Response containing messages for session."""

    session_id: str
    messages: list[dict[str, Any]]
    count: int
