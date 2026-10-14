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
from domain.llm.repositories import ILLMConfigRepository
from presentation.api.dependencies import get_llm_config_repo

router = APIRouter(prefix="/settings/llm", tags=["Settings: Multi-LLM"])


class SaveLLMConfigRequest(BaseModel):
    provider: str = Field(..., description="Provider slug: ollama, openai, anthropic, deepseek, gemini")
    name: str = Field(..., description="Display name")
    api_key: str = Field("", description="API Key (plain text or empty to leave unchanged)")
    base_url: str = Field("", description="Base endpoint URL")
    default_model: str = Field("", description="Default model identifier")
    temperature: float = Field(0.2, ge=0.0, le=2.0)
    max_tokens: int = Field(4096, ge=1, le=32768)


class ActivateProviderRequest(BaseModel):
    provider: str = Field(..., description="Provider slug to activate")


class TestConnectionRequest(BaseModel):
    provider: str
    api_key: str = ""
    base_url: str = ""
    default_model: str = ""


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
    )
    saved = await handler.handle(command)
    return {
        "status": "success",
        "message": f"Configuración para {saved.name} guardada exitosamente.",
        "config": saved.to_dict(mask_key=True),
    }


@router.post("/activate")
async def activate_llm_provider(
    payload: ActivateProviderRequest,
    repo: ILLMConfigRepository = Depends(get_llm_config_repo),
) -> dict[str, Any]:
    """Activate an LLM provider and deactivate all others atomically."""
    handler = ActivateLLMProviderCommandHandler(repo)
    command = ActivateLLMProviderCommand(provider=payload.provider)
    active = await handler.handle(command)
    return {
        "status": "success",
        "message": f"Proveedor activo cambiado a {active.name} ({active.default_model}).",
        "active_provider": active.provider.value,
        "active_model": active.default_model,
    }


@router.post("/test")
async def test_llm_connection(
    payload: TestConnectionRequest,
    repo: ILLMConfigRepository = Depends(get_llm_config_repo),
) -> dict[str, Any]:
    """Test connectivity, authentication and latency for an LLM provider."""
    # If api_key is omitted, look up the stored one
    api_key = payload.api_key
    base_url = payload.base_url
    default_model = payload.default_model

    if not api_key:
        from domain.llm.entities import LLMProvider
        try:
            prov = LLMProvider(payload.provider)
            existing = await repo.get_by_provider(prov)
            if existing:
                api_key = existing.api_key
                if not base_url:
                    base_url = existing.base_url
                if not default_model:
                    default_model = existing.default_model
        except Exception:
            pass

    handler = TestLLMConnectionCommandHandler()
    command = TestLLMConnectionCommand(
        provider=payload.provider,
        api_key=api_key,
        base_url=base_url,
        default_model=default_model,
    )
    result = await handler.handle(command)
    return result

