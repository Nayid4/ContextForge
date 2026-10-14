"""Settings and Ollama Models Management Web Routes."""

from __future__ import annotations

from pathlib import Path
from typing import Any
from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from application.settings.commands import UpdateSettingsCommand
from application.settings.handlers import (
    GetOllamaModelsQueryHandler,
    GetSettingsQueryHandler,
    UpdateSettingsCommandHandler,
)
from application.settings.queries import GetOllamaModelsQuery, GetSettingsQuery
from domain.llm.repositories import ILLMConfigRepository
from presentation.api.dependencies import (
    get_llm_config_repo,
    get_ollama_models_handler,
    get_settings_handler,
    get_update_settings_handler,
)

TEMPLATES_DIR = Path(__file__).resolve().parent.parent.parent
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

router = APIRouter(prefix="/settings", tags=["Frontend: Settings"])


def _format_model_size(size_bytes: int) -> str:
    """Format bytes to human-readable GB/MB."""
    if size_bytes >= 1024**3:
        return f"{size_bytes / (1024**3):.1f} GB"
    if size_bytes >= 1024**2:
        return f"{size_bytes / (1024**2):.1f} MB"
    return f"{size_bytes} B"


@router.get("", response_class=HTMLResponse)
async def settings_view(
    request: Request,
    settings_handler: GetSettingsQueryHandler = Depends(get_settings_handler),
    models_handler: GetOllamaModelsQueryHandler = Depends(get_ollama_models_handler),
    llm_repo: ILLMConfigRepository = Depends(get_llm_config_repo),
) -> HTMLResponse:
    """Render settings page with detected Ollama models and multi-provider configurations."""
    settings = await settings_handler.handle(GetSettingsQuery())
    models_raw = await models_handler.handle(GetOllamaModelsQuery())
    llm_configs = await llm_repo.get_all()
    active_llm = await llm_repo.get_active()

    models = [
        {
            **m,
            "formatted_size": _format_model_size(m.get("size_bytes", 0)),
            "is_active": m.get("name") == settings.active_llm_model,
        }
        for m in models_raw
    ]

    ollama_online = len(models_raw) > 0

    return templates.TemplateResponse(
        request=request,
        name="modules/settings/views/settings.html",
        context={
            "settings": settings,
            "models": models,
            "ollama_online": ollama_online,
            "llm_configs": [c.to_dict(mask_key=True) for c in llm_configs],
            "active_llm": active_llm.to_dict(mask_key=True),
            "success_message": None,
        },
    )


@router.post("", response_class=HTMLResponse)
async def update_settings_view(
    request: Request,
    active_llm_model: str = Form(...),
    ollama_url: str = Form("http://localhost:11434"),
    docs_path: str = Form("./docs"),
    embedding_model: str = Form("nomic-embed-text"),
    temperature: float = Form(0.2),
    settings_handler: GetSettingsQueryHandler = Depends(get_settings_handler),
    update_handler: UpdateSettingsCommandHandler = Depends(get_update_settings_handler),
    models_handler: GetOllamaModelsQueryHandler = Depends(get_ollama_models_handler),
    llm_repo: ILLMConfigRepository = Depends(get_llm_config_repo),
) -> HTMLResponse:
    """Save updated system settings and active LLM model."""
    command = UpdateSettingsCommand(
        active_llm_model=active_llm_model,
        ollama_url=ollama_url,
        docs_path=docs_path,
        embedding_model=embedding_model,
        temperature=temperature,
    )
    updated_settings = await update_handler.handle(command)
    models_raw = await models_handler.handle(GetOllamaModelsQuery())
    llm_configs = await llm_repo.get_all()
    active_llm = await llm_repo.get_active()

    models = [
        {
            **m,
            "formatted_size": _format_model_size(m.get("size_bytes", 0)),
            "is_active": m.get("name") == updated_settings.active_llm_model,
        }
        for m in models_raw
    ]

    ollama_online = len(models_raw) > 0

    return templates.TemplateResponse(
        request=request,
        name="modules/settings/views/settings.html",
        context={
            "settings": updated_settings,
            "models": models,
            "ollama_online": ollama_online,
            "llm_configs": [c.to_dict(mask_key=True) for c in llm_configs],
            "active_llm": active_llm.to_dict(mask_key=True),
            "success_message": f"Configuración guardada exitosamente. Modelo activo: {updated_settings.active_llm_model}",
        },
    )


@router.post("/refresh-models", response_class=HTMLResponse)
async def refresh_models_htmx(
    request: Request,
    settings_handler: GetSettingsQueryHandler = Depends(get_settings_handler),
    models_handler: GetOllamaModelsQueryHandler = Depends(get_ollama_models_handler),
    llm_repo: ILLMConfigRepository = Depends(get_llm_config_repo),
) -> HTMLResponse:
    """HTMX endpoint to refresh installed models from Ollama daemon."""
    settings = await settings_handler.handle(GetSettingsQuery())
    models_raw = await models_handler.handle(GetOllamaModelsQuery())
    llm_configs = await llm_repo.get_all()
    active_llm = await llm_repo.get_active()

    models = [
        {
            **m,
            "formatted_size": _format_model_size(m.get("size_bytes", 0)),
            "is_active": m.get("name") == settings.active_llm_model,
        }
        for m in models_raw
    ]

    ollama_online = len(models_raw) > 0

    return templates.TemplateResponse(
        request=request,
        name="modules/settings/views/settings.html",
        context={
            "settings": settings,
            "models": models,
            "ollama_online": ollama_online,
            "llm_configs": [c.to_dict(mask_key=True) for c in llm_configs],
            "active_llm": active_llm.to_dict(mask_key=True),
            "success_message": "Lista de modelos Ollama sincronizada en tiempo real.",
        },
    )

