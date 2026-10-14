"""Handler for GetChatHistoryQuery."""

from __future__ import annotations

from application.chat.queries.get_chat_history.query import GetChatHistoryQuery
from application.chat.queries.get_chat_history.response import (
    GetChatHistoryResponse,
)
from application.chat.queries.get_chat_history.validator import (
    GetChatHistoryValidator,
)
from application.mappers.chat_mapper import ChatMapper
from domain.chat.repositories import IChatSessionRepository


class GetChatHistoryHandler:
    """Retrieves message history for scoped session."""

    def __init__(self, chat_repo: IChatSessionRepository) -> None:
        self._chat_repo = chat_repo
        self._validator = GetChatHistoryValidator()

    async def handle(self, query: GetChatHistoryQuery) -> GetChatHistoryResponse:
        self._validator.validate(query)
        session = await self._chat_repo.get_session(query.session_id)
        if not session:
            return GetChatHistoryResponse(
                session_id=query.session_id,
                messages=[],
                count=0,
            )

        dtos = [ChatMapper.message_to_dto(m) for m in session.messages]
        return GetChatHistoryResponse(
            session_id=session.session_id,
            messages=dtos,
            count=len(dtos),
        )
