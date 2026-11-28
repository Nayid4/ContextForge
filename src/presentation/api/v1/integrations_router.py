"""External Integrations Router: Postman v2.1 Collection, Command Palette Hybrid Search & Chat Alias (0 classes)."""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends, Query, Request

from application.rag.commands.AskRagAssistant import AskRagAssistantCommand
from application.rag.queries.HybridSearchDocuments import HybridSearchDocumentsQuery
from domain.users import AuthPrincipal, PermissionAction
from infrastructure.di import DependencyContainer, get_container
from infrastructure.integrations import PostmanCollectionBuilder
from presentation.api.dependencies import build_cqrs_context, require_permission
from presentation.api.v1.schemas import RagAskPayload

router = APIRouter(tags=["External Integrations & Search"])


@router.get("/integrations/postman-collection")
async def get_postman_collection(
    base_url: str = Query("http://localhost:8000"),
    project: str = Query("default"),
) -> dict[str, Any]:
    return PostmanCollectionBuilder.build(base_url=base_url, project_slug=project)


@router.get("/search/hybrid")
async def command_palette_hybrid_search(
    request: Request,
    q: str = Query(...),
    project: str = Query("default"),
    top_k: int = Query(6, ge=1, le=20),
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.SEARCH_AND_ASK, project_param="project")),
    c: DependencyContainer = Depends(get_container),
) -> list[dict[str, Any]]:
    hits = await c.mediator.execute_or_raise(
        HybridSearchDocumentsQuery(query=q, project_slug=project, top_k=top_k),
        context=build_cqrs_context(request, principal, project),
    )
    return [
        {
            "file_path": h.path,
            "title": h.title,
            "header_hierarchy": list(h.headers),
            "text": h.text,
            "score": h.score,
        }
        for h in hits
    ]


@router.post("/chat/project")
async def chat_project_alias(
    payload: RagAskPayload,
    request: Request,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.SEARCH_AND_ASK)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    ans = await c.mediator.execute_or_raise(
        AskRagAssistantCommand(
            question=payload.question,
            project_slug=payload.project_slug,
            top_k=payload.top_k,
            user_id=principal.subject_id,
        ),
        context=build_cqrs_context(request, principal, payload.project_slug),
    )
    return {
        "answer": ans.answer,
        "grounded": ans.grounded,
        "provider": ans.provider_name,
        "citations": [{"path": cit.path, "title": cit.title, "score": cit.score} for cit in ans.citations],
    }
