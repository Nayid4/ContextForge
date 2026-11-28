"""Hybrid Search, Grounded RAG SSE Streaming, Scoped Chat & DLQ REST v1 Router (0 classes)."""

from __future__ import annotations

from dataclasses import asdict
import json
from typing import Any, AsyncGenerator
from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import StreamingResponse

from application.rag.commands.AskRagAssistant import AskRagAssistantCommand
from application.rag.commands.RetryDeadLetterJobs import RetryDeadLetterJobsCommand
from application.rag.queries.AskScopedDocument import AskScopedDocumentQuery
from application.rag.queries.GetChatSessionHistory import GetChatSessionHistoryQuery
from application.rag.queries.HybridSearchDocuments import HybridSearchDocumentsQuery
from domain.common import DomainException, PageParams
from domain.rag import IndexingJobStatus
from domain.users import AuthPrincipal, PermissionAction
from infrastructure.di import DependencyContainer, get_container
from presentation.api.dependencies import build_cqrs_context, require_permission
from presentation.api.v1.schemas import RagAskPayload, ScopedChatPayload

router = APIRouter(prefix="/rag", tags=["Hybrid Search & RAG Assistant (RAG)"])


async def _stream_rag_answer(request: Request, ans: Any) -> AsyncGenerator[str, None]:
    cits = [
        {
            **asdict(cit),
            "file_path": cit.path,
            "header": " > ".join(cit.headers) if cit.headers else cit.title,
            "pill": cit.path.split("/")[-1],
        }
        for cit in ans.citations
    ]
    yield f"event: citations\ndata: {json.dumps({'citations': cits, 'grounded': ans.grounded, 'sovereign_mode': ans.sovereign_mode}, ensure_ascii=False)}\n\n"
    words = ans.answer.split(" ")
    for idx, w in enumerate(words):
        if await request.is_disconnected():
            break
        tok = w + (" " if idx < len(words) - 1 else "")
        yield f"event: token\ndata: {json.dumps({'token': tok, 'content': tok}, ensure_ascii=False)}\n\n"
    done_meta = {
        "session_id": ans.session_id,
        "provider_name": ans.provider_name,
        "model_name": ans.model_name,
        "grounded": ans.grounded,
        "degraded_fallback": ans.degraded_fallback,
        "latency_ms": ans.latency_ms,
    }
    yield f"event: done\ndata: {json.dumps(done_meta, ensure_ascii=False)}\n\n"


@router.get("/search")
async def hybrid_search(
    request: Request,
    q: str = Query(...),
    project: str = Query("default"),
    top_k: int = Query(8, ge=1, le=50),
    mode: str = Query("hybrid"),
    ranking: str = Query("rrf"),
    module: str | None = Query(None),
    include_drafts: bool = Query(False),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.SEARCH_AND_ASK, project_param="project")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    allow_drafts = include_drafts and principal.can_perform(PermissionAction.WRITE_DOCUMENT, project).is_error is False
    hits = await c.mediator.execute_or_raise(
        HybridSearchDocumentsQuery(
            query=q,
            project_slug=project,
            top_k=top_k,
            mode=mode,
            ranking=ranking,
            module_name=module,
            include_drafts=allow_drafts,
        ),
        context=build_cqrs_context(request, principal, project),
    )
    return {"results": [asdict(h) for h in hits], "count": len(hits)}


@router.post("/ask")
async def ask_rag_json(
    payload: RagAskPayload,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.SEARCH_AND_ASK)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    chk = principal.can_perform(PermissionAction.SEARCH_AND_ASK, project_slug=payload.project_slug)
    if chk.is_error:
        raise DomainException(chk.first_error)
    ans = await c.mediator.execute_or_raise(
        AskRagAssistantCommand(
            question=payload.question,
            project_slug=payload.project_slug,
            top_k=payload.top_k,
            mode=payload.mode,
            ranking=payload.ranking,
            module_name=payload.module_name,
            session_id=payload.session_id,
            book_id=payload.book_id,
            user_id=principal.subject_id,
        ),
        context=build_cqrs_context(request, principal, payload.project_slug),
    )
    return asdict(ans)


@router.post("/stream")
async def ask_rag_sse_stream_post(
    payload: RagAskPayload,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.SEARCH_AND_ASK)),
    c: DependencyContainer = Depends(get_container),
) -> StreamingResponse:
    chk = principal.can_perform(PermissionAction.SEARCH_AND_ASK, project_slug=payload.project_slug)
    if chk.is_error:
        raise DomainException(chk.first_error)
    ans = await c.mediator.execute_or_raise(
        AskRagAssistantCommand(
            question=payload.question,
            project_slug=payload.project_slug,
            top_k=payload.top_k,
            mode=payload.mode,
            ranking=payload.ranking,
            module_name=payload.module_name,
            session_id=payload.session_id,
            book_id=payload.book_id,
            user_id=principal.subject_id,
        ),
        context=build_cqrs_context(request, principal, payload.project_slug),
    )
    return StreamingResponse(
        _stream_rag_answer(request, ans),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


@router.get("/stream")
async def ask_rag_sse_stream_get(
    request: Request,
    q: str = Query(...),
    project: str = Query("default"),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.SEARCH_AND_ASK, project_param="project")),
    c: DependencyContainer = Depends(get_container),
) -> StreamingResponse:
    ans = await c.mediator.execute_or_raise(
        AskRagAssistantCommand(question=q, project_slug=project, user_id=principal.subject_id),
        context=build_cqrs_context(request, principal, project),
    )
    return StreamingResponse(
        _stream_rag_answer(request, ans),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


@router.post("/scoped")
async def ask_scoped_document(
    payload: ScopedChatPayload,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.SEARCH_AND_ASK)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    res: dict[str, Any] = await c.mediator.execute_or_raise(
        AskScopedDocumentQuery(
            question=payload.question,
            document_title=payload.document_title,
            document_path=payload.document_path,
            content_markdown=payload.content_markdown,
            project_slug=payload.project_slug,
        ),
        context=build_cqrs_context(request, principal, payload.project_slug),
    )
    return res


@router.get("/sessions/{session_id}")
async def get_session_messages(
    session_id: str,
    project: str = Query("default"),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.SEARCH_AND_ASK, project_param="project")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    msgs = await c.mediator.execute_or_raise(GetChatSessionHistoryQuery(session_id=session_id, project_slug=project))
    return {"session_id": session_id, "messages": [asdict(m) for m in msgs]}


@router.delete("/sessions/{session_id}")
async def clear_session(
    session_id: str,
    project: str = Query("default"),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.SEARCH_AND_ASK, project_param="project")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    cleared = await c.chat_repo.clear_session(session_id, project)
    return {"cleared": cleared, "session_id": session_id}


@router.get("/jobs")
async def list_indexing_jobs(
    project: str | None = Query(None),
    status: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    st_enum = IndexingJobStatus(status) if status in {s.value for s in IndexingJobStatus} else None
    paged = await c.indexing_job_repo.list_paginated(
        project_slug=project,
        status=st_enum,
        pagination=PageParams(page=page, page_size=page_size),
    )
    return {
        "page": paged.page,
        "page_size": paged.page_size,
        "total_count": paged.total_count,
        "total_pages": paged.total_pages,
        "has_prev": paged.has_prev,
        "has_next": paged.has_next,
        "items": [
            {
                "job_id": j.job_id,
                "book_id": j.book_id,
                "project_slug": j.project_slug,
                "path": j.path,
                "status": j.status.value,
                "attempts": j.attempts,
                "chunks_indexed": j.chunks_indexed,
                "error_detail": j.error_detail,
                "updated_at": j.updated_at.isoformat(),
            }
            for j in paged.items
        ],
    }


@router.post("/dlq/retry")
async def retry_dlq_jobs(
    request: Request,
    project: str = Query("default"),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.WRITE_DOCUMENT, project_param="project")),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    retried = await c.mediator.execute_or_raise(
        RetryDeadLetterJobsCommand(project_slug=project),
        context=build_cqrs_context(request, principal, project),
    )
    return {"retried_jobs": retried, "project_slug": project}
