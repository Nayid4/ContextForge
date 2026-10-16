"""Settings Application Query & Command Handlers (LLM, CLI, Database, and Storage)."""

from __future__ import annotations

from typing import Any
from domain.infrastructure_config.entities import (
    DatabaseConfiguration,
    DatabaseProvider,
    StorageConfiguration,
    StorageProvider,
)
from domain.infrastructure_config.repositories import IInfrastructureConfigRepository
from domain.rag_engine.repositories import IOllamaClient
from domain.settings.entities import SystemSettings
from domain.settings.repositories import ISettingsRepository
from application.settings.commands import (
    ActivateDatabaseProviderCommand,
    ActivateLLMProviderCommand,
    ActivateStorageProviderCommand,
    SaveDatabaseConfigCommand,
    SaveLLMConfigCommand,
    SaveStorageConfigCommand,
    TestDatabaseConnectionCommand,
    TestLLMConnectionCommand,
    TestStorageConnectionCommand,
    UpdateSettingsCommand,
)
from application.settings.queries import (
    GetActiveLLMConfigQuery,
    GetInfrastructureConfigsQuery,
    GetLLMConfigsQuery,
    GetOllamaModelsQuery,
    GetSettingsQuery,
)
from domain.llm.entities import (
    EngineType,
    LLMConfiguration,
    LLMProvider,
    infer_engine_type,
    is_masked_api_key,
    sanitize_api_key,
)
from domain.llm.repositories import ILLMConfigRepository
from infrastructure.external.llm.llm_factory import LLMFactory
from infrastructure.persistence.database_factory import DatabaseFactory
from infrastructure.storage.storage_factory import StorageFactory


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
        eng_type = (
            EngineType(command.engine_type)
            if command.engine_type in [e.value for e in EngineType]
            else infer_engine_type(prov)
        )
        existing = await self._repo.get_by_provider(prov)
        resolved_api_key = command.api_key
        if is_masked_api_key(resolved_api_key):
            resolved_api_key = existing.api_key if existing is not None else ""
        else:
            resolved_api_key = sanitize_api_key(resolved_api_key)

        config = LLMConfiguration(
            id=prov.value,
            provider=prov,
            name=command.name,
            engine_type=eng_type,
            api_key=resolved_api_key,
            base_url=command.base_url.strip(),
            default_model=command.default_model.strip(),
            cli_command=(
                command.cli_command.strip()
                or (existing.cli_command if existing is not None else "")
            ),
            cli_args=(
                command.cli_args
                if command.cli_args != ""
                else (existing.cli_args if existing is not None else "")
            ),
            temperature=command.temperature,
            max_tokens=command.max_tokens,
            is_active=existing.is_active if existing is not None else False,
        )
        await self._repo.save(config)
        saved = await self._repo.get_by_provider(prov)
        return saved or config


class ActivateLLMProviderCommandHandler:
    """Handler to switch the active LLM provider."""

    def __init__(
        self,
        llm_config_repo: ILLMConfigRepository,
        settings_repo: ISettingsRepository | None = None,
    ) -> None:
        self._repo = llm_config_repo
        self._settings_repo = settings_repo

    async def handle(self, command: ActivateLLMProviderCommand) -> LLMConfiguration:
        prov = LLMProvider(command.provider)
        await self._repo.set_active_provider(prov)
        active = await self._repo.get_active()

        # Synchronize global system settings active_llm_model and embedding_model
        if self._settings_repo is not None:
            try:
                curr_settings = await self._settings_repo.get_settings()
                curr_settings.active_llm_model = active.default_model
                rec_emb = active.to_dict().get("embedding_model")
                if rec_emb:
                    curr_settings.embedding_model = str(rec_emb)
                await self._settings_repo.save_settings(curr_settings)
            except Exception:
                pass

        return active


class TestLLMConnectionCommandHandler:
    """Handler to test connection with an LLM provider."""

    __test__ = False

    def __init__(self, llm_config_repo: ILLMConfigRepository | None = None) -> None:
        self._repo = llm_config_repo

    async def handle(self, command: TestLLMConnectionCommand) -> dict[str, Any]:
        prov = LLMProvider(command.provider)
        eng_type = (
            EngineType(command.engine_type)
            if command.engine_type in [e.value for e in EngineType]
            else infer_engine_type(prov)
        )

        existing = await self._repo.get_by_provider(prov) if self._repo is not None else None

        raw_key = command.api_key.strip()
        if not raw_key or is_masked_api_key(raw_key):
            resolved_api_key = existing.api_key if existing is not None else ""
        else:
            resolved_api_key = sanitize_api_key(raw_key)

        resolved_base_url = command.base_url.strip() or (
            existing.base_url if existing is not None else ""
        )
        resolved_model = command.default_model.strip() or (
            existing.default_model if existing is not None else ""
        )
        resolved_cli_cmd = command.cli_command.strip() or (
            existing.cli_command if existing is not None else ""
        )
        resolved_cli_args = command.cli_args or (
            existing.cli_args if existing is not None else ""
        )

        temp_config = LLMConfiguration(
            id=prov.value,
            provider=prov,
            name=prov.value,
            engine_type=eng_type,
            api_key=resolved_api_key,
            base_url=resolved_base_url,
            default_model=resolved_model,
            cli_command=resolved_cli_cmd,
            cli_args=resolved_cli_args,
        )
        client = LLMFactory.create_client(temp_config)
        is_healthy, message, latency_ms = await client.test_connection()
        return {
            "healthy": is_healthy,
            "message": message,
            "latency_ms": latency_ms,
            "provider": prov.value,
            "engine_type": eng_type.value,
        }


class GetInfrastructureConfigsQueryHandler:
    """Handler to retrieve all Database and Storage configurations."""

    def __init__(self, repo: IInfrastructureConfigRepository) -> None:
        self._repo = repo

    async def handle(self, query: GetInfrastructureConfigsQuery | None = None) -> dict[str, Any]:
        dbs = await self._repo.get_all_databases()
        active_db = await self._repo.get_active_database()
        stors = await self._repo.get_all_storages()
        active_storage = await self._repo.get_active_storage()
        return {
            "databases": [d.to_dict(mask_secrets=True) for d in dbs],
            "active_database": active_db.provider.value,
            "storages": [s.to_dict(mask_secrets=True) for s in stors],
            "active_storage": active_storage.provider.value,
        }


class SaveDatabaseConfigCommandHandler:
    """Handler to persist a Database provider configuration."""

    def __init__(self, repo: IInfrastructureConfigRepository) -> None:
        self._repo = repo

    async def handle(self, command: SaveDatabaseConfigCommand) -> DatabaseConfiguration:
        prov = DatabaseProvider(command.provider)
        cfg = DatabaseConfiguration(
            id=prov.value,
            provider=prov,
            name=command.name,
            connection_url=command.connection_url,
            host=command.host,
            port=command.port,
            database_name=command.database_name,
            username=command.username,
            password=command.password,
            api_key=command.api_key,
            project_id=command.project_id,
            ssl_enabled=command.ssl_enabled,
        )
        return await self._repo.save_database(cfg)


class ActivateDatabaseProviderCommandHandler:
    """Handler to switch the active Database provider."""

    def __init__(self, repo: IInfrastructureConfigRepository) -> None:
        self._repo = repo

    async def handle(self, command: ActivateDatabaseProviderCommand) -> DatabaseConfiguration:
        prov = DatabaseProvider(command.provider)
        return await self._repo.activate_database(prov)


class TestDatabaseConnectionCommandHandler:
    """Handler to test connectivity with a Database provider."""

    __test__ = False

    def __init__(self, repo: IInfrastructureConfigRepository | None = None) -> None:
        self._repo = repo

    async def handle(self, command: TestDatabaseConnectionCommand) -> dict[str, Any]:
        prov = DatabaseProvider(command.provider)
        existing = await self._repo.get_database_by_provider(prov) if self._repo else None

        pwd = command.password
        if not pwd or is_masked_api_key(pwd):
            pwd = existing.password if existing else ""
        else:
            pwd = sanitize_api_key(pwd)

        api_key = command.api_key
        if not api_key or is_masked_api_key(api_key):
            api_key = existing.api_key if existing else ""
        else:
            api_key = sanitize_api_key(api_key)

        temp_cfg = DatabaseConfiguration(
            id=prov.value,
            provider=prov,
            name=existing.name if existing else prov.value,
            connection_url=command.connection_url or (existing.connection_url if existing else ""),
            host=command.host or (existing.host if existing else ""),
            port=command.port or (existing.port if existing else 0),
            database_name=command.database_name or (existing.database_name if existing else ""),
            username=command.username or (existing.username if existing else ""),
            password=pwd,
            api_key=api_key,
            project_id=command.project_id or (existing.project_id if existing else ""),
            ssl_enabled=command.ssl_enabled,
        )
        healthy, msg, latency_ms = await DatabaseFactory.test_connection(temp_cfg)
        return {
            "healthy": healthy,
            "message": msg,
            "latency_ms": latency_ms,
            "provider": prov.value,
        }


class SaveStorageConfigCommandHandler:
    """Handler to persist a Storage provider configuration."""

    def __init__(self, repo: IInfrastructureConfigRepository) -> None:
        self._repo = repo

    async def handle(self, command: SaveStorageConfigCommand) -> StorageConfiguration:
        prov = StorageProvider(command.provider)
        cfg = StorageConfiguration(
            id=prov.value,
            provider=prov,
            name=command.name,
            base_path=command.base_path,
            endpoint_url=command.endpoint_url,
            bucket_name=command.bucket_name,
            region=command.region,
            access_key=command.access_key,
            secret_key=command.secret_key,
            project_id=command.project_id,
            sync_local_mirror=command.sync_local_mirror,
        )
        return await self._repo.save_storage(cfg)


class ActivateStorageProviderCommandHandler:
    """Handler to switch the active Storage provider."""

    def __init__(self, repo: IInfrastructureConfigRepository) -> None:
        self._repo = repo

    async def handle(self, command: ActivateStorageProviderCommand) -> StorageConfiguration:
        prov = StorageProvider(command.provider)
        return await self._repo.activate_storage(prov)


class TestStorageConnectionCommandHandler:
    """Handler to test connectivity with a Storage provider."""

    __test__ = False

    def __init__(self, repo: IInfrastructureConfigRepository | None = None) -> None:
        self._repo = repo

    async def handle(self, command: TestStorageConnectionCommand) -> dict[str, Any]:
        prov = StorageProvider(command.provider)
        existing = await self._repo.get_storage_by_provider(prov) if self._repo else None

        sec_key = command.secret_key
        if not sec_key or is_masked_api_key(sec_key):
            sec_key = existing.secret_key if existing else ""
        else:
            sec_key = sanitize_api_key(sec_key)

        temp_cfg = StorageConfiguration(
            id=prov.value,
            provider=prov,
            name=existing.name if existing else prov.value,
            base_path=command.base_path or (existing.base_path if existing else "./docs"),
            endpoint_url=command.endpoint_url or (existing.endpoint_url if existing else ""),
            bucket_name=command.bucket_name or (existing.bucket_name if existing else ""),
            region=command.region or (existing.region if existing else ""),
            access_key=command.access_key or (existing.access_key if existing else ""),
            secret_key=sec_key,
            project_id=command.project_id or (existing.project_id if existing else ""),
            sync_local_mirror=command.sync_local_mirror,
        )
        gateway = StorageFactory.create_gateway(temp_cfg)
        healthy, msg, latency_ms = await gateway.test_connection()
        return {
            "healthy": healthy,
            "message": msg,
            "latency_ms": latency_ms,
            "provider": prov.value,
        }
