"""Handler for SendScopedMessageCommand."""

from __future__ import annotations

import uuid
from application.chat.commands.send_scoped_message.command import (
    SendScopedMessageCommand,
)
from application.chat.commands.send_scoped_message.response import (
    SendScopedMessageResponse,
)
from application.chat.commands.send_scoped_message.validator import (
    SendScopedMessageValidator,
)
from application.chat.services import ScopedChatService
from domain.chat.entities import ChatMessage, DocumentSourceRef, ScopedChatSession
from domain.chat.repositories import IChatSessionRepository


class SendScopedMessageHandler:
    """Orchestrates sending a message in a scoped chat and saving conversational turns."""

    def __init__(
        self,
        chat_repo: IChatSessionRepository,
        chat_service: ScopedChatService,
    ) -> None:
        self._chat_repo = chat_repo
        self._chat_service = chat_service
        self._validator = SendScopedMessageValidator()

    async def handle(self, command: SendScopedMessageCommand) -> SendScopedMessageResponse:
        self._validator.validate(command)
        session = await self._chat_repo.get_session(command.session_id)
        if not session:
            session = ScopedChatSession(
                session_id=command.session_id,
                book_id=command.book_id,
                library_id=command.library_id,
            )
            await self._chat_repo.save_session(session)

        # Append user message
        user_msg = ChatMessage(
            id=str(uuid.uuid4()),
            role="user",
            content=command.user_message,
        )
        await self._chat_repo.append_message(command.session_id, user_msg)

        # Generate answer using ScopedChatService
        res = await self._chat_service.answer_question(
            library_id=command.library_id,
            book_id=command.book_id,
            raw_markdown=command.raw_markdown,
            user_query=command.user_message,
        )

        answer_text = str(res.get("answer", ""))
        raw_sources = res.get("sources", [])
        source_refs: list[DocumentSourceRef] = []
        for s in raw_sources:
            if isinstance(s, dict):
                source_refs.append(
                    DocumentSourceRef(
                        document_path=str(s.get("document_path", "")),
                        location=str(s.get("location", "")),
                        excerpt=str(s.get("excerpt", "")),
                        is_attachment=bool(s.get("is_attachment", False)),
                        attachment_name=s.get("attachment_name"),
                    )
                )

        assistant_msg = ChatMessage(
            id=str(uuid.uuid4()),
            role="assistant",
            content=answer_text,
            sources=source_refs,
        )
        await self._chat_repo.append_message(command.session_id, assistant_msg)

        return SendScopedMessageResponse(
            session_id=command.session_id,
            message_id=assistant_msg.id,
            assistant_response=answer_text,
            sources=[s.to_dict() for s in source_refs],
        )
