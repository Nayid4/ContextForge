"""Agent Studio Web Routes (0 classes)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import HTMLResponse

from domain.agents import AgentTemplateCatalog
from domain.rag import SovereignRoutingPolicy
from infrastructure.config.env_file_loader import EnvFileLoader
from infrastructure.di import DependencyContainer, get_container
from presentation.web.shared.jinja_templates import resolve_active_project_slug, templates

router = APIRouter(tags=["Web: Agents Studio"])


@router.get("/agents", response_class=HTMLResponse)
async def agents_studio_view(
    request: Request,
    project: str | None = Query(None),
    c: DependencyContainer = Depends(get_container),
) -> HTMLResponse:
    active_project = await resolve_active_project_slug(request, c, project)
    agents = await c.agent_repo.list_all(project_slug=active_project)
    providers = await c.llm_config_repo.list_all()
    try:
        active_llm = await c.llm_config_repo.get_active()
    except Exception:
        active_llm = None
    docs = await c.doc_repo.list_all(project_slug=active_project)
    modules = sorted({d.module_name for d in docs if d.module_name})
    base_url = str(request.base_url).rstrip("/")

    serialized_agents = [
        {
            "agent_id": a.agent_id,
            "project_slug": a.project_slug,
            "slug": a.slug,
            "openai_model_id": a.openai_model_id,
            "name": a.name,
            "description": a.description,
            "system_prompt": a.system_prompt,
            "llm_provider": a.llm_provider,
            "llm_model": a.llm_model,
            "temperature": a.temperature,
            "max_tokens": a.max_tokens,
            "top_k": a.top_k,
            "min_grounding_score": a.min_grounding_score,
            "allowed_modules": list(a.allowed_modules),
            "allowed_statuses": list(a.allowed_statuses),
            "welcome_message": a.welcome_message,
            "suggested_questions": list(a.suggested_questions),
            "topic_boundaries": a.topic_boundaries,
            "visibility": a.visibility,
            "daily_quota_requests": a.daily_quota_requests,
            "current_version": a.current_version,
        }
        for a in agents
    ]
    serialized_providers = []
    for p in providers:
        decrypted = c.vault.decrypt(p.api_key_encrypted) if p.api_key_encrypted else ""
        eff_key, key_source = EnvFileLoader.resolve_provider_api_key(p.provider, decrypted)
        serialized_providers.append(
            {
                "provider": p.provider,
                "name": p.name,
                "engine_type": p.engine_type,
                "default_model": p.default_model,
                "egress": SovereignRoutingPolicy.classify_egress(
                    provider_engine_type=p.engine_type,
                    base_url=p.cli_command if p.engine_type == "local_cli" else p.base_url,
                    provider_name=p.provider,
                ),
                "has_api_key": bool(eff_key),
                "key_source": key_source if eff_key else "missing",
                "is_active": bool(active_llm and p.provider == active_llm.provider),
            }
        )

    return templates.TemplateResponse(
        request=request,
        name="features/agents/views/agents_studio.html",
        context={
            "active_project": active_project,
            "agents": serialized_agents,
            "providers": serialized_providers,
            "templates_catalog": AgentTemplateCatalog.list_all(),
            "available_modules": modules,
            "base_url": base_url,
            "allow_public_cli_agents": c.settings.env.allow_public_cli_agents,
        },
    )
