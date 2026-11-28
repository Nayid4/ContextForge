"""OpenAI-Compatible Gateway (/v1/models & /v1/chat/completions with model='project/agent') (0 classes)."""

from __future__ import annotations

import json
import time
import uuid
from typing import Any, AsyncGenerator
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from domain.common import DomainError, DomainException
from domain.users import AuthPrincipal, PermissionAction
from infrastructure.di import DependencyContainer, get_container
from presentation.api.dependencies import require_permission
from presentation.api.v1.agents_router import build_agent_executor
from presentation.api.v1.schemas.openai_chat_request_payload import OpenAiChatRequestPayload

router = APIRouter(prefix="/v1", tags=["OpenAI-Compatible Agent API"])


def _extract_conversation_and_question(messages: list[dict[str, Any]]) -> tuple[list[tuple[str, str]], str]:
    """Extracts sanitized multi-turn (user/assistant) history and final user question; ignores client 'system' roles."""
    cleaned: list[tuple[str, str]] = []
    for msg in messages:
        role = str(msg.get("role", "")).strip().lower()
        if role not in ("user", "assistant"):
            continue
        content = msg.get("content", "")
        text = ""
        if isinstance(content, str):
            text = content.strip()
        elif isinstance(content, list):
            text = " ".join(str(p.get("text", "")) for p in content if isinstance(p, dict)).strip()
        if text:
            cleaned.append((role, text))
    for idx in range(len(cleaned) - 1, -1, -1):
        if cleaned[idx][0] == "user":
            return cleaned[:idx], cleaned[idx][1]
    return [], ""


@router.get("/models")
async def list_openai_compatible_models(
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_KNOWLEDGE)),
    c: DependencyContainer = Depends(get_container),
) -> dict[str, Any]:
    agents = await c.agent_repo.list_all()
    data = []
    for a in agents:
        if not a.is_active:
            continue
        if principal.can_invoke_agent(a.project_slug, a.slug, a.visibility).is_error:
            continue
        data.append(
            {
                "id": a.openai_model_id,
                "object": "model",
                "created": int(a.created_at.timestamp()),
                "owned_by": f"contextforge:{a.project_slug}",
                "visibility": a.visibility,
            }
        )
    return {"object": "list", "data": data}


@router.post("/chat/completions")
async def openai_chat_completions(
    payload: OpenAiChatRequestPayload,
    principal: AuthPrincipal = Depends(require_permission(PermissionAction.SEARCH_AND_ASK)),
    c: DependencyContainer = Depends(get_container),
) -> Any:
    # Validate unsupported OpenAI parameters and input limits explicitly (HTTP 400 OpenAI error contract)
    if payload.tools is not None or payload.tool_choice is not None:
        raise DomainException(
            DomainError.validation(
                "unsupported_parameter",
                "El parámetro 'tools'/'tool_choice' (function calling) no está soportado en el Gateway RAG de ContextForge.",
            )
        )
    if payload.n != 1:
        raise DomainException(
            DomainError.validation("unsupported_parameter", "Solo se soporta n=1 en /v1/chat/completions.")
        )
    if payload.response_format is not None:
        raise DomainException(
            DomainError.validation("unsupported_parameter", "El parámetro 'response_format' estructurado no está soportado aún en este endpoint.")
        )
    if len(payload.messages) > 50:
        raise DomainException(
            DomainError.validation("messages_limit_exceeded", "Se excedió el máximo permitido de 50 mensajes por solicitud.")
        )
    total_chars = sum(len(str(m.get("content", ""))) for m in payload.messages)
    if total_chars > 32000:
        raise DomainException(
            DomainError.validation("context_length_exceeded", "El historial de mensajes supera el límite máximo de 32,000 caracteres.")
        )

    raw_model = (payload.model or "default/assistant").strip()
    if "/" in raw_model:
        project_slug, agent_slug = [p.strip() for p in raw_model.split("/", 1)]
    else:
        project_slug, agent_slug = "default", raw_model

    chk = principal.can_perform(PermissionAction.SEARCH_AND_ASK, project_slug=project_slug)
    if chk.is_error:
        raise DomainException(chk.first_error)

    agent = await c.agent_repo.get_by_slug(project_slug, agent_slug)
    if agent is None:
        raise DomainException(
            DomainError.not_found(
                "agent_not_found",
                f"Agente '{project_slug}/{agent_slug}' no encontrado. Usa GET /v1/models para listar los disponibles.",
            )
        )

    inv = principal.can_invoke_agent(project_slug, agent_slug, agent.visibility)
    if inv.is_error:
        raise DomainException(inv.first_error)

    ag_q = c.rate_limiter.check_daily_quota(f"agent:{project_slug}/{agent_slug}", agent.daily_quota_requests)
    if ag_q.is_error:
        raise DomainException(ag_q.first_error)
    if principal.key_id:
        key_q = c.rate_limiter.check_daily_quota(f"key_oai:{principal.key_id}", agent.daily_quota_requests)
        if key_q.is_error:
            raise DomainException(key_q.first_error)

    # Note: client-supplied 'system' messages are stripped so callers cannot override agent topic_boundaries.
    history, question = _extract_conversation_and_question(payload.messages)
    if not question:
        raise DomainException(DomainError.validation("empty_user_message", "Se requiere al menos un mensaje con role='user'."))

    executor = await build_agent_executor(c)
    completion_id = f"chatcmpl-{uuid.uuid4().hex[:20]}"
    created_ts = int(time.time())

    if payload.stream:
        async def _sse() -> AsyncGenerator[str, None]:
            async for tok in executor.stream_execute(
                agent=agent,
                question=question,
                conversation_history=history,
            ):
                chunk = {
                    "id": completion_id,
                    "object": "chat.completion.chunk",
                    "created": created_ts,
                    "model": agent.openai_model_id,
                    "choices": [{"index": 0, "delta": {"content": tok}, "finish_reason": None}],
                }
                yield f"data: {json.dumps(chunk, ensure_ascii=False)}\n\n"
            final_chunk = {
                "id": completion_id,
                "object": "chat.completion.chunk",
                "created": created_ts,
                "model": agent.openai_model_id,
                "choices": [{"index": 0, "delta": {}, "finish_reason": "stop"}],
            }
            yield f"data: {json.dumps(final_chunk, ensure_ascii=False)}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(_sse(), media_type="text/event-stream", headers={"Cache-Control": "no-cache"})

    result = await executor.execute(
        agent=agent,
        question=question,
        user_id=principal.subject_id,
        conversation_history=history,
    )
    answer_text = str(result["answer"])
    prompt_tokens = max(1, len(question.split()) * 2)
    completion_tokens = max(1, len(answer_text.split()) * 2)
    safe_citations = (
        result["citations"]
        if principal.can_inspect_internals
        else [
            {"path": cit.get("path", ""), "title": cit.get("title", ""), "headers": cit.get("headers", [])}
            for cit in result["citations"]
        ]
    )
    cf_meta: dict[str, Any] = {
        "grounded": result["grounded"],
        "egress_destination": result.get("egress_destination", "local"),
        "rewritten_query": result.get("rewritten_query", question),
        "latency_ms": result["latency_ms"],
        "citations": safe_citations,
    }
    if principal.can_inspect_internals:
        cf_meta["provider"] = result["provider_name"]
        cf_meta["underlying_model"] = result["model_name"]

    return {
        "id": completion_id,
        "object": "chat.completion",
        "created": created_ts,
        "model": agent.openai_model_id,
        "choices": [
            {
                "index": 0,
                "message": {"role": "assistant", "content": answer_text},
                "finish_reason": "stop",
            }
        ],
        "usage": {
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": prompt_tokens + completion_tokens,
        },
        "contextforge": cf_meta,
    }
