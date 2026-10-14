"""Handler for AskScopedDocumentQuery."""

from __future__ import annotations

from application.chat.queries.ask_scoped_document.query import (
    AskScopedDocumentQuery,
)
from application.chat.queries.ask_scoped_document.response import (
    AskScopedDocumentResponse,
)
from application.chat.queries.ask_scoped_document.validator import (
    AskScopedDocumentValidator,
)
from application.chat.services import ScopedChatService


class AskScopedDocumentHandler:
    """Answers a scoped question using ScopedChatService."""

    def __init__(self, chat_service: ScopedChatService) -> None:
        self._chat_service = chat_service
        self._validator = AskScopedDocumentValidator()

    async def handle(self, query: AskScopedDocumentQuery) -> AskScopedDocumentResponse:
        self._validator.validate(query)
        result = await self._chat_service.answer_question(
            library_id=query.library_id,
            book_id=query.book_id,
            raw_markdown=query.raw_markdown,
            user_query=query.query,
            history=query.history,
        )
        return AskScopedDocumentResponse(
            answer=str(result.get("answer", "")),
            sources=list(result.get("sources", [])),
        )
