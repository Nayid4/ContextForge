"""Settings Application Query & Command Handlers."""

from __future__ import annotations

from typing import Any
from domain.rag_engine.repositories import IOllamaClient
from domain.settings.entities import SystemSettings
from domain.settings.repositories import ISettingsRepository
from application.settings.commands import (
    ActivateLLMProviderCommand,
    SaveLLMConfigCommand,
    TestLLMConnectionCommand,
    UpdateSettingsCommand,
)
from application.settings.queries import (
    GetActiveLLMConfigQuery,
    GetLLMConfigsQuery,
    GetOllamaModelsQuery,
    GetSettingsQuery,
)
from domain.llm.entities import LLMConfiguration, LLMProvider
from domain.llm.repositories import ILLMConfigRepository
from infrastructure.external.llm.llm_factory import LLMFactory


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


class GetLLMConfigsQueryHandler:
    """Handler to get all registered LLM configurations."""

    def __init__(self, llm_config_repo: ILLMConfigRepository) -> None:
        self._repo = llm_config_repo

    async def handle(self, query: GetLLMConfigsQuery) -> list[LLMConfiguration]:
        return await self._repo.get_all()


class GetActiveLLMConfigQueryHandler:
    """Handler to get the currently active LLM configuration."""

    def __init__(self, llm_config_repo: ILLMConfigRepository) -> None:
        self._repo = llm_config_repo

    async def handle(self, query: GetActiveLLMConfigQuery) -> LLMConfiguration:
        return await self._repo.get_active()


class SaveLLMConfigCommandHandler:
    """Handler to save or update an LLM provider configuration."""

    def __init__(self, llm_config_repo: ILLMConfigRepository) -> None:
        self._repo = llm_config_repo

    async def handle(self, command: SaveLLMConfigCommand) -> LLMConfiguration:
        prov = LLMProvider(command.provider)
        config = LLMConfiguration(
            id=prov.value,
            provider=prov,
            name=command.name,
            api_key=command.api_key,
            base_url=command.base_url,
            default_model=command.default_model,
            temperature=command.temperature,
            max_tokens=command.max_tokens,
        )
        await self._repo.save(config)
        saved = await self._repo.get_by_provider(prov)
        return saved or config


class ActivateLLMProviderCommandHandler:
    """Handler to switch the active LLM provider."""

    def __init__(self, llm_config_repo: ILLMConfigRepository) -> None:
        self._repo = llm_config_repo

    async def handle(self, command: ActivateLLMProviderCommand) -> LLMConfiguration:
        prov = LLMProvider(command.provider)
        await self._repo.set_active_provider(prov)
        return await self._repo.get_active()


class TestLLMConnectionCommandHandler:
    """Handler to test connection with an LLM provider."""

    __test__ = False

    async def handle(self, command: TestLLMConnectionCommand) -> dict[str, Any]:
        prov = LLMProvider(command.provider)
        temp_config = LLMConfiguration(
            id=prov.value,
            provider=prov,
            name=prov.value,
            api_key=command.api_key,
            base_url=command.base_url,
            default_model=command.default_model,
        )
        client = LLMFactory.create_client(temp_config)
        is_healthy, message, latency_ms = await client.test_connection()
        return {
            "healthy": is_healthy,
            "message": message,
            "latency_ms": latency_ms,
            "provider": prov.value,
        }

