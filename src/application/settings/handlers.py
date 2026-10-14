"""Settings Application Query & Command Handlers."""

from __future__ import annotations

from typing import Any
from domain.rag_engine.repositories import IOllamaClient
from domain.settings.entities import SystemSettings
from domain.settings.repositories import ISettingsRepository
from application.settings.commands import UpdateSettingsCommand
from application.settings.queries import GetOllamaModelsQuery, GetSettingsQuery


class GetSettingsQueryHandler:
    """Handler to get current settings."""

    def __init__(self, settings_repo: ISettingsRepository) -> None:
        self._settings_repo = settings_repo

    async def handle(self, query: GetSettingsQuery) -> SystemSettings:
        return await self._settings_repo.get_settings()


class GetOllamaModelsQueryHandler:
    """Handler to query Ollama API and detect installed models."""

    def __init__(self, ollama_client: IOllamaClient) -> None:
        self._ollama_client = ollama_client

    async def handle(self, query: GetOllamaModelsQuery) -> list[dict[str, Any]]:
        return await self._ollama_client.get_installed_models()


class UpdateSettingsCommandHandler:
    """Handler to persist updated settings."""

    def __init__(self, settings_repo: ISettingsRepository) -> None:
        self._settings_repo = settings_repo

    async def handle(self, command: UpdateSettingsCommand) -> SystemSettings:
        settings = SystemSettings(
            id="default",
            active_llm_model=command.active_llm_model,
            ollama_url=command.ollama_url,
            docs_path=command.docs_path,
            embedding_model=command.embedding_model,
            temperature=command.temperature,
        )
        await self._settings_repo.save_settings(settings)
        return settings

