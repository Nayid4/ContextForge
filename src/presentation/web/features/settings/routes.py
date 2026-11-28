"""Settings, Multi-LLM, Ollama Refresh & Infrastructure Web Routes (0 classes)."""

from __future__ import annotations

import os
from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse

from domain.rag import SovereignRoutingPolicy
from infrastructure.config import EnvFileLoader
from infrastructure.di import DependencyContainer, get_container
from infrastructure.integrations import HttpMultiLlmAdapter
from presentation.web.shared.jinja_templates import resolve_active_project_slug, templates

router = APIRouter(tags=["Web: Settings"])

RECOMMENDED_MODELS_BY_PROVIDER: dict[str, list[str]] = {
    "ollama": ["llama3.1:8b", "qwen2.5-coder:7b", "deepseek-r1:8b", "mistral:7b", "gemma3:4b"],
    "lmstudio": ["local-model", "qwen2.5-coder-7b-instruct", "llama-3.1-8b-instruct"],
    "openai": ["gpt-4o-mini", "gpt-4o", "o3-mini", "gpt-4.1-mini"],
    "gemini": ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"],
    "anthropic": ["claude-3-5-sonnet-latest", "claude-3-7-sonnet-latest", "claude-3-5-haiku-latest"],
    "openrouter": ["openai/gpt-4o-mini", "anthropic/claude-3.5-sonnet", "google/gemini-2.5-flash", "deepseek/deepseek-chat"],
    "deepseek": ["deepseek-chat", "deepseek-reasoner"],
    "antigravity_cli": ["default", "gemini-2.5-pro", "claude-sonnet-4"],
    "claude_cli": ["sonnet", "opus", "haiku"],
    "gemini_cli": ["gemini-2.5-flash", "gemini-2.5-pro"],
    "codex_cli": ["default", "o3-mini", "gpt-4o"],
    "opencode_cli": ["default"],
    "aider_cli": ["default"],
    "extractive_fallback": ["extractive-v2"],
}


@router.get("/settings", response_class=HTMLResponse)
@router.post("/settings/refresh-models", response_class=HTMLResponse)
async def settings_view(request: Request, c: DependencyContainer = Depends(get_container)) -> HTMLResponse:
    active_project = await resolve_active_project_slug(request, c)
    providers = await c.llm_config_repo.list_all()
    active_llm = await c.llm_config_repo.get_active()
    settings = await c.settings_repo.get_settings()
    projects = await c.project_repo.list_projects()
    project_agents = await c.agent_repo.list_all(project_slug=active_project)
    bind_host = (os.getenv("UVICORN_HOST") or os.getenv("HOST") or "127.0.0.1").strip()
    bind_warning = c.settings.env.auth_mode == "local" and bind_host in {"0.0.0.0", "::"}

    ollama_models: list[dict[str, object]] = []
    ollama_cfg = next((p for p in providers if p.provider == "ollama"), None)
    if ollama_cfg is not None:
        ollama_models = await HttpMultiLlmAdapter(ollama_cfg, timeout_sec=1.5).list_ollama_models()
    ollama_names = [str(m.get("name", "")) for m in ollama_models if m.get("name")]

    llm_configs = []
    for p in providers:
        env_var = EnvFileLoader.provider_env_var(p.provider)
        env_ok = EnvFileLoader.has_env_secret(p.provider)
        egress_cls = p.egress_class or SovereignRoutingPolicy.classify_egress(
            provider_engine_type=p.engine_type,
            base_url=p.cli_command if p.engine_type == "local_cli" else p.base_url,
            provider_name=p.provider,
        )
        base_models = list(RECOMMENDED_MODELS_BY_PROVIDER.get(p.provider, [p.default_model] if p.default_model else []))
        if p.provider == "ollama" and ollama_names:
            for nm in ollama_names:
                if nm not in base_models:
                    base_models.insert(0, nm)
        if p.default_model and p.default_model not in base_models:
            base_models.insert(0, p.default_model)
        llm_configs.append(
            {
                "provider": p.provider,
                "engine_type": p.engine_type,
                "egress_class": egress_cls,
                "name": p.name,
                "base_url": p.base_url,
                "api_key": c.vault.mask(c.vault.decrypt(p.api_key_encrypted)) if p.api_key_encrypted else "",
                "env_var_name": env_var,
                "env_configured": env_ok,
                "default_model": p.default_model,
                "recommended_models": base_models,
                "cli_command": p.cli_command,
                "cli_args": p.cli_args,
                "temperature": p.temperature,
                "max_tokens": p.max_tokens,
                "is_active": p.is_active,
                "recommended_embedding_models": ["nomic-embed-text", "mxbai-embed-large", "text-embedding-3-small"],
            }
        )

    # Real supported database & storage adapters only (remediating SET-07)
    db_configs = [
        {"provider": "sqlite", "name": "SQLite WAL", "connection_url": c.settings.db.database_url, "is_active": c.settings.db.db_provider == "sqlite"},
        {"provider": "postgresql", "name": "PostgreSQL", "connection_url": "postgresql+asyncpg://user:pass@localhost:5432/contextforge", "is_active": c.settings.db.db_provider == "postgresql"},
    ]
    storage_configs = [
        {"provider": "local_fs", "name": "Local FS", "base_path": c.settings.storage.local_storage_path, "is_active": c.settings.storage.storage_provider == "local_fs"},
        {"provider": "s3", "name": "S3 / MinIO / R2", "base_path": "s3://contextforge-bucket", "is_active": c.settings.storage.storage_provider == "s3"},
    ]

    return templates.TemplateResponse(
        request=request,
        name="features/settings/views/settings.html",
        context={
            "active_project": active_project,
            "projects": projects,
            "project_agents": project_agents,
            "auth_mode": c.settings.env.auth_mode,
            "strict_bind_check": c.settings.env.strict_bind_check,
            "bind_host": bind_host,
            "bind_warning": bind_warning,
            "llm_configs": llm_configs,
            "active_llm": active_llm,
            "settings": settings,
            "ollama_models": ollama_models,
            "db_configs": db_configs,
            "active_db": next((d for d in db_configs if d["is_active"]), db_configs[0]),
            "storage_configs": storage_configs,
            "active_storage": next((s for s in storage_configs if s["is_active"]), storage_configs[0]),
            "success_message": "Modelos de Ollama actualizados." if request.method == "POST" else "",
        },
    )
