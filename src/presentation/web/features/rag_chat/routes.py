"""Grounded RAG Chat & SSE Stream Web Routes (0 classes)."""

from __future__ import annotations

import json
from typing import Any, AsyncGenerator
from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import HTMLResponse, StreamingResponse

from application.rag.commands.AskRagAssistant import AskRagAssistantCommand
from infrastructure.di import DependencyContainer, get_container
from presentation.api.v1.agents_router import build_agent_executor
from presentation.api.v1.rag_chat_router import _stream_rag_answer
from presentation.web.shared.jinja_templates import resolve_active_project_slug, templates

router = APIRouter(tags=["Web: RAG Chat"])


async def _enrich_citations_with_steward(
    c: DependencyContainer,
    project_slug: str,
    raw_cits: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    users_map = {u.user_id: u for u in await c.user_repo.list_users()}
    out: list[dict[str, Any]] = []
    for cit in raw_cits:
        path = str(cit.get("path") or cit.get("file_path") or "")
        doc = await c.doc_repo.get_by_path(path, project_slug=project_slug) if path else None
        steward_name = ""
        steward_email = ""
        reviewed_at = ""
        freshness = "fresh"
        if doc is not None:
            if doc.steward_user_id and doc.steward_user_id in users_map:
                steward_name = users_map[doc.steward_user_id].full_name
                steward_email = users_map[doc.steward_user_id].email
            elif doc.author:
                steward_name = doc.author
            if doc.last_reviewed_at:
                reviewed_at = doc.last_reviewed_at.strftime("%Y-%m-%d")
            freshness = doc.freshness_status
        out.append(
            {
                **cit,
                "file_path": path,
                "header": " > ".join(cit.get("headers", [])) if cit.get("headers") else cit.get("title", ""),
                "pill": path.split("/")[-1],
                "last_reviewed_at": reviewed_at,
                "freshness_status": freshness,
                "steward_name": steward_name,
                "steward_email": steward_email,
            }
        )
    return out


async def _stream_agent_answer(
    request: Request,
    res: dict[str, Any],
    c: DependencyContainer,
    project_slug: str,
) -> AsyncGenerator[str, None]:
    cits = await _enrich_citations_with_steward(c, project_slug, list(res.get("citations", [])))
    yield f"event: citations\ndata: {json.dumps({'citations': cits, 'grounded': res.get('grounded', False), 'sovereign_mode': res.get('sovereign_mode', False)}, ensure_ascii=False)}\n\n"
    words = str(res.get("answer", "")).split(" ")
    for idx, w in enumerate(words):
        if await request.is_disconnected():
            break
        tok = w + (" " if idx < len(words) - 1 else "")
        yield f"event: token\ndata: {json.dumps({'token': tok, 'content': tok}, ensure_ascii=False)}\n\n"
    done_meta = {
        "agent_slug": res.get("agent_slug", ""),
        "provider_name": res.get("provider_name", ""),
        "model_name": res.get("model_name", ""),
        "grounded": res.get("grounded", False),
        "degraded_fallback": res.get("degraded_fallback", False),
        "latency_ms": res.get("latency_ms", 0.0),
    }
    yield f"event: done\ndata: {json.dumps(done_meta, ensure_ascii=False)}\n\n"


@router.get("/chat", response_class=HTMLResponse)
@router.get("/asistente-ia", response_class=HTMLResponse)
async def rag_chat_view(
    request: Request,
    project: str | None = Query(None),
    agent: str | None = Query(None),
    c: DependencyContainer = Depends(get_container),
) -> HTMLResponse:
    active_project = await resolve_active_project_slug(request, c, project)
    active_llm = await c.llm_config_repo.get_active()
    settings = await c.settings_repo.get_settings()
    project_agents = await c.agent_repo.list_all(project_slug=active_project)
    selected_agent = next((a for a in project_agents if a.slug == (agent or "").strip()), None)
    docs = await c.doc_repo.list_all(project_slug=active_project, only_published=True)
    if selected_agent and selected_agent.suggested_questions:
        suggestions = list(selected_agent.suggested_questions[:4])
    else:
        suggestions = [f"Resume las reglas clave de {d.title}" for d in docs[:3]] or [
            "¿Cuáles son las reglas de negocio principales del proyecto?",
            "Explica la política de reintentos y manejo de errores.",
        ]
    return templates.TemplateResponse(
        request=request,
        name="features/rag_chat/views/chat.html",
        context={
            "active_project": active_project,
            "active_llm": active_llm,
            "settings": settings,
            "project_agents": project_agents,
            "selected_agent": selected_agent,
            "suggested_questions": suggestions,
        },
    )


@router.get("/chat/stream")
async def rag_chat_stream_web(
    request: Request,
    q: str = Query(...),
    project: str | None = Query(None),
    agent: str | None = Query(None),
    c: DependencyContainer = Depends(get_container),
) -> StreamingResponse:
    active_project = await resolve_active_project_slug(request, c, project)
    if agent and agent.strip():
        agent_ent = await c.agent_repo.get_by_slug(active_project, agent.strip())
        if agent_ent is not None:
            executor = await build_agent_executor(c)
            res = await executor.execute(agent=agent_ent, question=q)
            return StreamingResponse(
                _stream_agent_answer(request, res, c, active_project),
                media_type="text/event-stream",
                headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
            )
    ans = await c.mediator.execute_or_raise(AskRagAssistantCommand(question=q, project_slug=active_project))
    return StreamingResponse(
        _stream_rag_answer(request, ans),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )
