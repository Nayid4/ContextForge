"""RAG Ingestion and Inference REST API Endpoints with SSE streaming."""

from __future__ import annotations

import json
from typing import Any, AsyncGenerator
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from application.rag_engine.handlers import AskRagQueryHandler
from application.rag_engine.queries import AskRagQuery
from presentation.api.dependencies import get_ask_rag_handler

router = APIRouter(prefix="/rag", tags=["RAG Engine"])


class AskRagRequest(BaseModel):
    query: str
    top_k: int = 5
    model: str | None = None
    project: str = "default"


class AskRagResponse(BaseModel):
    query: str
    answer: str
    model: str
    citations: list[dict[str, str]]


@router.post("/ask", response_model=AskRagResponse)
async def ask_rag(
    payload: AskRagRequest,
    handler: AskRagQueryHandler = Depends(get_ask_rag_handler),
) -> Any:
    """Execute Grounded RAG query and return consolidated response with citations."""
    context, model = await handler.prepare_context(
        AskRagQuery(
            query=payload.query,
            top_k=payload.top_k,
            model=payload.model,
            project_slug=payload.project,
        )
    )

    tokens: list[str] = []
    async for token in handler.stream_answer(context, model):
        tokens.append(token)

    full_answer = "".join(tokens)
    seen_paths: set[str] = set()
    citations: list[dict[str, str]] = []
    for c in context.citations:
        if c.file_path not in seen_paths:
            seen_paths.add(c.file_path)
            citations.append(
                {"file_path": c.file_path, "header": c.header, "snippet": c.snippet, "pill": c.format_pill()}
            )

    return {
        "query": payload.query,
        "answer": full_answer,
        "model": model,
        "citations": citations,
    }


@router.get("/stream")
async def stream_rag(
    q: str = Query(..., description="Developer question"),
    model: str | None = Query(None, description="Optional LLM model override"),
    top_k: int = Query(5, ge=1, le=10),
    project: str = Query("default", description="Project slug for isolated RAG context"),
    handler: AskRagQueryHandler = Depends(get_ask_rag_handler),
) -> StreamingResponse:
    """Server-Sent Events (SSE) streaming endpoint for RAG chat."""
    context, target_model = await handler.prepare_context(
        AskRagQuery(query=q, top_k=top_k, model=model, project_slug=project)
    )

    async def event_generator() -> AsyncGenerator[str, None]:
        # Emit citations first
        seen_event_paths: set[str] = set()
        citations_data: list[dict[str, str]] = []
        for c in context.citations:
            if c.file_path not in seen_event_paths:
                seen_event_paths.add(c.file_path)
                citations_data.append(
                    {"file_path": c.file_path, "header": c.header, "pill": c.format_pill()}
                )
        meta_event = json.dumps({
            "type": "citations",
            "model": target_model,
            "citations": citations_data,
            "sources": citations_data,
        })
        yield f"event: citations\ndata: {meta_event}\n\n"

        # Stream tokens
        async for token in handler.stream_answer(context, target_model):
            chunk_event = json.dumps({"type": "token", "content": token, "token": token})
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

