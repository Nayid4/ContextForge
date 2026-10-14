"""Chat Domain Repository Protocols."""

from __future__ import annotations

from typing import Protocol
from domain.chat.entities import ChatMessage, ScopedChatSession


class IChatSessionRepository(Protocol):
    """Protocol for persisting and retrieving scoped chat sessions."""

    async def get_session(self, session_id: str) -> ScopedChatSession | None:
        ...

    async def save_session(self, session: ScopedChatSession) -> ScopedChatSession:
        ...

    async def append_message(self, session_id: str, message: ChatMessage) -> ChatMessage:
        ...

    async def list_sessions_for_book(self, book_id: str) -> list[ScopedChatSession]:
        ...
