"""Settings and Ollama Detection REST API Endpoints."""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from application.settings.commands import UpdateSettingsCommand
from application.settings.handlers import (
    GetOllamaModelsQueryHandler,
    GetSettingsQueryHandler,
    UpdateSettingsCommandHandler,
)
from application.settings.queries import GetOllamaModelsQuery, GetSettingsQuery
from presentation.api.dependencies import (
    get_ollama_models_handler,
    get_settings_handler,
    get_update_settings_handler,
)

router = APIRouter(prefix="/settings", tags=["Settings & Ollama"])


class SettingsResponse(BaseModel):
    active_llm_model: str
    ollama_url: str
    docs_path: str
    embedding_model: str
    temperature: float


class UpdateSettingsRequest(BaseModel):
    active_llm_model: str
    ollama_url: str = "http://localhost:11434"
    docs_path: str = "./docs"
    embedding_model: str = "nomic-embed-text"
    temperature: float = 0.2


@router.get("", response_model=SettingsResponse)
async def get_system_settings(
    handler: GetSettingsQueryHandler = Depends(get_settings_handler),
) -> Any:
    """Retrieve current ContextForge configuration."""
    settings = await handler.handle(GetSettingsQuery())
    return {
        "active_llm_model": settings.active_llm_model,
        "ollama_url": settings.ollama_url,
        "docs_path": settings.docs_path,
        "embedding_model": settings.embedding_model,
        "temperature": settings.temperature,
    }


@router.post("", response_model=SettingsResponse)
async def update_system_settings(
    payload: UpdateSettingsRequest,
    handler: UpdateSettingsCommandHandler = Depends(get_update_settings_handler),
) -> Any:
    """Update active LLM model and system configuration."""
    command = UpdateSettingsCommand(
        active_llm_model=payload.active_llm_model,
        ollama_url=payload.ollama_url,
        docs_path=payload.docs_path,
        embedding_model=payload.embedding_model,
        temperature=payload.temperature,
    )
    settings = await handler.handle(command)
    return {
        "active_llm_model": settings.active_llm_model,
        "ollama_url": settings.ollama_url,
        "docs_path": settings.docs_path,
        "embedding_model": settings.embedding_model,
        "temperature": settings.temperature,
    }


@router.get("/ollama-models")
async def list_installed_ollama_models(
    handler: GetOllamaModelsQueryHandler = Depends(get_ollama_models_handler),
) -> Any:
    """Detect and list LLM models currently installed in the local Ollama daemon."""
    models = await handler.handle(GetOllamaModelsQuery())
    return {"models": models, "count": len(models)}

