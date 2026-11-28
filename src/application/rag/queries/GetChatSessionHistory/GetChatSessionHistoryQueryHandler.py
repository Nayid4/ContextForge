from __future__ import annotations
from application.rag.queries.GetChatSessionHistory.GetChatSessionHistoryQuery import GetChatSessionHistoryQuery
from domain.common import ErrorOr
from domain.rag import ChatMessageEntity, IChatRepositoryPort

class GetChatSessionHistoryQueryHandler:
    def __init__(self, chat_repo: IChatRepositoryPort) -> None:
        self._repo = chat_repo

    async def handle(self, request: GetChatSessionHistoryQuery) -> ErrorOr[list[ChatMessageEntity]]:
        msgs = await self._repo.list_messages(request.session_id, request.project_slug)
        return ErrorOr.ok(msgs)
