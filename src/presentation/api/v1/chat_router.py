"""Chat REST API v1 Router for Scoped RAG and conversational sessions."""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from application.chat.commands.send_scoped_message import (
    SendScopedMessageCommand,
    SendScopedMessageHandler,
)
from application.chat.queries.ask_scoped_document import (
    AskScopedDocumentHandler,
    AskScopedDocumentQuery,
)
from application.chat.queries.get_chat_history import (
    GetChatHistoryHandler,
    GetChatHistoryQuery,
)
from application.chat.services import ScopedChatService
from infrastructure.repositories.sql_chat_repo import SqlChatSessionRepository
from presentation.api.dependencies import (
    get_chat_session_repo,
    get_scoped_chat_service,
)

router = APIRouter(prefix="/chat", tags=["Scoped Document Chat"])


class ScopedAskPayload(BaseModel):
    library_id: str = Field(..., description="Library / Project unique slug")
    book_id: str = Field(..., description="Document path or ID")
    query: str = Field(..., description="Question directed to this document")
    raw_markdown: str = Field(default="", description="Full raw markdown if available for Zero-RAG")


class SendMessagePayload(BaseModel):
    session_id: str = Field(..., description="Unique chat session ID")
    library_id: str = Field(default="default", description="Library slug")
    book_id: str = Field(..., description="Document path or ID")
    user_message: str = Field(..., description="User message")
    raw_markdown: str = Field(default="", description="Full raw markdown if available")


@router.post("/scoped", summary="Ask pinpointed question to a document")
async def ask_scoped_document(
    payload: ScopedAskPayload,
    chat_service: ScopedChatService = Depends(get_scoped_chat_service),
) -> dict[str, Any]:
    handler = AskScopedDocumentHandler(chat_service)
    try:
        res = await handler.handle(
            AskScopedDocumentQuery(
                library_id=payload.library_id,
                book_id=payload.book_id,
                query=payload.query,
                raw_markdown=payload.raw_markdown,
            )
        )
        return {
            "answer": res.answer,
            "sources": res.sources,
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/messages", summary="Send message inside a persistent scoped chat session")
async def send_chat_message(
    payload: SendMessagePayload,
    chat_repo: SqlChatSessionRepository = Depends(get_chat_session_repo),
    chat_service: ScopedChatService = Depends(get_scoped_chat_service),
) -> dict[str, Any]:
    handler = SendScopedMessageHandler(chat_repo, chat_service)
    try:
        res = await handler.handle(
            SendScopedMessageCommand(
                session_id=payload.session_id,
                library_id=payload.library_id,
                book_id=payload.book_id,
                user_message=payload.user_message,
                raw_markdown=payload.raw_markdown,
            )
        )
        return {
            "session_id": res.session_id,
            "message_id": res.message_id,
            "assistant_response": res.assistant_response,
            "sources": res.sources,
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/session/{session_id}", summary="Get message history for a scoped session")
async def get_session_history(
    session_id: str,
    chat_repo: SqlChatSessionRepository = Depends(get_chat_session_repo),
) -> dict[str, Any]:
    handler = GetChatHistoryHandler(chat_repo)
    res = await handler.handle(GetChatHistoryQuery(session_id=session_id))
    return {
        "session_id": res.session_id,
        "messages": res.messages,
        "count": res.count,
    }
