"""RAG Chat Web Presentation Routes with SSE Streaming."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, AsyncGenerator
from fastapi import APIRouter, Cookie, Depends, Query, Request
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.templating import Jinja2Templates
from application.rag_engine.handlers import AskRagQueryHandler
from application.rag_engine.queries import AskRagQuery
from application.settings.handlers import GetSettingsQueryHandler
from application.settings.queries import GetSettingsQuery
from presentation.api.dependencies import get_ask_rag_handler, get_settings_handler

TEMPLATES_DIR = Path(__file__).resolve().parent.parent.parent
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

router = APIRouter(prefix="/chat", tags=["Frontend: RAG Chat"])


@router.get("", response_class=HTMLResponse)
async def chat_view(
    request: Request,
    cf_active_project: str | None = Cookie(default=None),
    settings_handler: GetSettingsQueryHandler = Depends(get_settings_handler),
) -> HTMLResponse:
    """Render RAG conversational assistant interface."""
    settings = await settings_handler.handle(GetSettingsQuery())
    active_slug = cf_active_project or "default"
    suggested_questions = [
        "¿Cuál es la política de reintentos en pagos y webhooks?",
        "¿Cuál es el timeout para procesar el webhook de Stripe?",
        "Explica la arquitectura orientada a eventos para pagos.",
        "¿Qué ocurre si un webhook de pago falla repetidamente?",
    ]

    return templates.TemplateResponse(
        request=request,
        name="modules/rag_chat/views/chat.html",
        context={
            "settings": settings,
            "suggested_questions": suggested_questions,
            "active_project": active_slug,
        },
    )


@router.get("/stream")
async def chat_stream_sse(
    q: str = Query(..., min_length=1),
    project: str | None = Query(default=None),
    cf_active_project: str | None = Cookie(default=None),
    handler: AskRagQueryHandler = Depends(get_ask_rag_handler),
) -> StreamingResponse:
    """Server-Sent Events streaming endpoint for interactive RAG chat."""
    active_slug = project or cf_active_project or "default"
    context, target_model = await handler.prepare_context(AskRagQuery(query=q, project_slug=active_slug))


    async def event_generator() -> AsyncGenerator[str, None]:
        # Send unique citations first
        seen_paths: set[str] = set()
        citations_data: list[dict[str, str]] = []
        for c in context.citations:
            if c.file_path not in seen_paths:
                seen_paths.add(c.file_path)
                citations_data.append(
                    {"file_path": c.file_path, "header": c.header, "pill": c.format_pill()}
                )
        meta_event = json.dumps({"type": "citations", "model": target_model, "citations": citations_data})
        yield f"event: citations\ndata: {meta_event}\n\n"

        # Stream LLM tokens
        async for token in handler.stream_answer(context, target_model):
            chunk_event = json.dumps({"type": "token", "content": token})
            yield f"event: token\ndata: {chunk_event}\n\n"

        yield f"event: done\ndata: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

