"""REST API Endpoints for Multi-LLM Provider Configuration and Testing."""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from application.settings.commands import (
    ActivateLLMProviderCommand,
    SaveLLMConfigCommand,
    TestLLMConnectionCommand,
)
from application.settings.handlers import (
    ActivateLLMProviderCommandHandler,
    GetActiveLLMConfigQueryHandler,
    GetLLMConfigsQueryHandler,
    SaveLLMConfigCommandHandler,
    TestLLMConnectionCommandHandler,
)
from application.settings.queries import GetActiveLLMConfigQuery, GetLLMConfigsQuery
from application.settings.queries.discover_cli_engines import (
    DiscoverCLIEnginesQuery,
    DiscoverCLIEnginesQueryHandler,
)
from domain.llm.repositories import ILLMConfigRepository
from presentation.api.dependencies import get_llm_config_repo

router = APIRouter(prefix="/settings/llm", tags=["Settings: Multi-LLM"])


class SaveLLMConfigRequest(BaseModel):
    provider: str = Field(..., description="Provider slug: ollama, openai, anthropic, deepseek, gemini, lm_studio, localai, claude_code_cli, antigravity_cli, codex_cli, open_code_cli, aider_cli, ollama_cli")
    name: str = Field(..., description="Display name")
    api_key: str = Field("", description="API Key (plain text or empty/masked to leave unchanged)")
    base_url: str = Field("", description="Base endpoint URL")
    default_model: str = Field("", description="Default model identifier")
    temperature: float = Field(0.2, ge=0.0, le=2.0)
    max_tokens: int = Field(4096, ge=1, le=32768)
    engine_type: str = Field("", description="Engine category: local_http, cloud_api, local_cli")
    cli_command: str = Field("", description="Executable binary for CLI engines")
    cli_args: str = Field("", description="CLI flags template with {prompt} and {model}")


class ActivateProviderRequest(BaseModel):
    provider: str = Field(..., description="Provider slug to activate")


class TestConnectionRequest(BaseModel):
    provider: str
    api_key: str = ""
    base_url: str = ""
    default_model: str = ""
    engine_type: str = ""
    cli_command: str = ""
    cli_args: str = ""


@router.get("")
async def get_all_llm_configs(
    repo: ILLMConfigRepository = Depends(get_llm_config_repo),
) -> dict[str, Any]:
    """List all registered LLM providers with masked API keys and active status."""
    handler = GetLLMConfigsQueryHandler(repo)
    configs = await handler.handle(GetLLMConfigsQuery())
    active_handler = GetActiveLLMConfigQueryHandler(repo)
    active = await active_handler.handle(GetActiveLLMConfigQuery())

    return {
        "providers": [c.to_dict(mask_key=True) for c in configs],
        "active_provider": active.provider.value,
        "active_model": active.default_model,
        "active_engine_type": active.engine_type.value,
    }


@router.get("/discover-cli")
async def discover_cli_engines() -> dict[str, Any]:
    """Auto-discover local AI CLI tools installed in the host OS PATH."""
    handler = DiscoverCLIEnginesQueryHandler()
    items = await handler.handle(DiscoverCLIEnginesQuery())
    installed_count = sum(1 for item in items if item.is_installed)
    return {
        "engines": [
            {
                "provider": item.provider,
                "name": item.name,
                "cli_command": item.command,
                "installed": item.is_installed,
                "binary_path": item.path,
                "recommended_args": item.recommended_args,
                "default_model": item.default_model,
            }
            for item in items
        ],
        "installed_count": installed_count,
    }


@router.post("")
async def save_llm_config(
    payload: SaveLLMConfigRequest,
    repo: ILLMConfigRepository = Depends(get_llm_config_repo),
) -> dict[str, Any]:
    """Persist or update provider credentials and parameters."""
    handler = SaveLLMConfigCommandHandler(repo)
    command = SaveLLMConfigCommand(
        provider=payload.provider,
        name=payload.name,
        api_key=payload.api_key,
        base_url=payload.base_url,
        default_model=payload.default_model,
        temperature=payload.temperature,
        max_tokens=payload.max_tokens,
        engine_type=payload.engine_type,
        cli_command=payload.cli_command,
        cli_args=payload.cli_args,
    )
    saved = await handler.handle(command)
    return {
        "status": "success",
        "message": f"Configuración para {saved.name} guardada exitosamente.",
        "config": saved.to_dict(mask_key=True),
    }


from domain.settings.repositories import ISettingsRepository
from presentation.api.dependencies import get_llm_config_repo, get_settings_repo


@router.post("/activate")
async def activate_llm_provider(
    payload: ActivateProviderRequest,
    repo: ILLMConfigRepository = Depends(get_llm_config_repo),
    settings_repo: ISettingsRepository = Depends(get_settings_repo),
) -> dict[str, Any]:
    """Activate an LLM provider and deactivate all others atomically."""
    handler = ActivateLLMProviderCommandHandler(repo, settings_repo=settings_repo)
    command = ActivateLLMProviderCommand(provider=payload.provider)
    active = await handler.handle(command)
    return {
        "status": "success",
        "message": f"Proveedor activo cambiado a {active.name} ({active.default_model}).",
        "active_provider": active.provider.value,
        "active_model": active.default_model,
        "active_engine_type": active.engine_type.value,
    }


@router.post("/test")
async def test_llm_connection(
    payload: TestConnectionRequest,
    repo: ILLMConfigRepository = Depends(get_llm_config_repo),
) -> dict[str, Any]:
    """Test connectivity, authentication and latency for an LLM provider."""
    handler = TestLLMConnectionCommandHandler(llm_config_repo=repo)
    command = TestLLMConnectionCommand(
        provider=payload.provider,
        api_key=payload.api_key,
        base_url=payload.base_url,
        default_model=payload.default_model,
        engine_type=payload.engine_type,
        cli_command=payload.cli_command,
        cli_args=payload.cli_args,
    )
    result = await handler.handle(command)
    return result


class TestEmbeddingRequest(BaseModel):
    provider: str
    embedding_model: str = ""
    api_key: str = ""
    base_url: str = ""


@router.post("/test-embedding")
async def test_llm_embedding(
    payload: TestEmbeddingRequest,
    repo: ILLMConfigRepository = Depends(get_llm_config_repo),
) -> dict[str, Any]:
    """Test vector embedding generation for a provider (Gemini Embeddings 2, OpenAI, Voyage AI, Ollama)."""
    from domain.llm.entities import (
        LLMProvider,
        PROVIDER_ECOSYSTEM_CATALOG,
        is_masked_api_key,
        sanitize_api_key,
    )
    from infrastructure.external.llm.llm_factory import LLMFactory

    prov = LLMProvider(payload.provider)
    meta = PROVIDER_ECOSYSTEM_CATALOG.get(prov.value, {})
    existing = await repo.get_by_provider(prov)
    raw_key = payload.api_key.strip()
    if not raw_key or is_masked_api_key(raw_key):
        resolved_key = existing.api_key if existing is not None else ""
    else:
        resolved_key = sanitize_api_key(raw_key)

    resolved_base_url = payload.base_url.strip() or (
        existing.base_url if existing is not None else ""
    )
    emb_provider = str(meta.get("embedding_provider", prov.value))
    emb_model = payload.embedding_model or str(meta.get("default_embedding_model", "nomic-embed-text"))
    return await LLMFactory.test_embedding_connection(
        embedding_provider=emb_provider,
        embedding_model=emb_model,
        api_key=resolved_key,
        base_url=resolved_base_url,
    )


