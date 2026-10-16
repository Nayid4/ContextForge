"""Chat REST API v1 Router for Scoped RAG and conversational sessions."""

from __future__ import annotations

import logging
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

logger = logging.getLogger("presentation.api.chat_router")

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
from domain.knowledge_docs.repositories import IDocumentRepository
from infrastructure.repositories.sql_chat_repo import SqlChatSessionRepository
from presentation.api.dependencies import (
    get_chat_session_repo,
    get_doc_repo,
    get_scoped_chat_service,
)

router = APIRouter(prefix="/chat", tags=["Scoped Document Chat"])


class ScopedAskPayload(BaseModel):
    library_id: str = Field(..., description="Library / Project unique slug")
    book_id: str = Field(..., description="Document path or ID")
    query: str = Field(..., description="Question directed to this document")
    raw_markdown: str = Field(default="", description="Full raw markdown if available for Zero-RAG")
    history: list[dict[str, str]] = Field(default_factory=list, description="Conversational history turns")


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
    doc_repo: IDocumentRepository = Depends(get_doc_repo),
) -> dict[str, Any]:
    handler = AskScopedDocumentHandler(chat_service)
    raw_md = payload.raw_markdown
    if not raw_md:
        doc = await doc_repo.get_by_path(payload.book_id, project_slug=payload.library_id)
        if doc:
            raw_md = doc.content_markdown

    try:
        res = await handler.handle(
            AskScopedDocumentQuery(
                library_id=payload.library_id,
                book_id=payload.book_id,
                query=payload.query,
                raw_markdown=raw_md,
                history=payload.history,
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


class AskProjectPayload(BaseModel):
    project_slug: str = Field(default="default", description="Target project slug")
    question: str = Field(..., description="Question across the project knowledge base")
    provider_override: str = Field(default="", description="Optional provider override")
    top_k: int = Field(default=6, ge=1, le=20)


@router.post("/project", summary="Ask a question across the entire project using any Universal AI Engine")
async def ask_project_context_endpoint(
    payload: AskProjectPayload,
) -> dict[str, Any]:
    from application.chat.commands.ask_project_context import (
        AskProjectContextCommand,
        AskProjectContextCommandHandler,
    )
    from presentation.api.dependencies import (
        get_hybrid_searcher,
        get_llm_config_repo,
        get_session_factory,
    )

    session_factory = get_session_factory()
    searcher = get_hybrid_searcher()
    async with session_factory() as session:
        llm_repo = get_llm_config_repo(session)
        handler = AskProjectContextCommandHandler(
            config_repo=llm_repo,
            hybrid_searcher=searcher,
        )
        try:
            res = await handler.handle(
                AskProjectContextCommand(
                    project_slug=payload.project_slug,
                    user_query=payload.question,
                    provider_override=payload.provider_override,
                )
            )
            return res.to_dict()
        except Exception as e:
            logger.error("Error in ask_project_context_endpoint: %s", e, exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error al procesar consulta con el motor de IA: {str(e)}",
            )

