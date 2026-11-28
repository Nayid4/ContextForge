"""Chat session and message history repository port supporting agent_id, agent_version & telemetry."""

from __future__ import annotations

from typing import Protocol

from domain.rag.chat_message_entity import ChatMessageEntity
from domain.rag.chat_session_entity import ChatSessionEntity


class IChatRepositoryPort(Protocol):
    async def get_or_create_session(
        self,
        session_id: str | None,
        project_slug: str,
        book_id: str | None = None,
        user_id: str | None = None,
        agent_id: str | None = None,
        agent_version: int | None = None,
    ) -> ChatSessionEntity: ...
    async def append_message(self, message: ChatMessageEntity) -> ChatMessageEntity: ...
    async def list_messages(self, session_id: str, project_slug: str) -> list[ChatMessageEntity]: ...
    async def clear_session(self, session_id: str, project_slug: str) -> bool: ...
