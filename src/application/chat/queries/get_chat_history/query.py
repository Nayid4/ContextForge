"""GetChatHistory query definition."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class GetChatHistoryQuery:
    """Query to retrieve all turns in a scoped chat session."""

    session_id: str
