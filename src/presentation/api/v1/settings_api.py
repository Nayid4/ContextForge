"""Settings, Ollama Detection, and Hexagonal Database/Storage REST API Endpoints."""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from application.settings.commands import (
    ActivateDatabaseProviderCommand,
    ActivateStorageProviderCommand,
    SaveDatabaseConfigCommand,
    SaveStorageConfigCommand,
    TestDatabaseConnectionCommand,
    TestStorageConnectionCommand,
    UpdateSettingsCommand,
)
from application.settings.handlers import (
    ActivateDatabaseProviderCommandHandler,
    ActivateStorageProviderCommandHandler,
    GetInfrastructureConfigsQueryHandler,
    GetOllamaModelsQueryHandler,
    GetSettingsQueryHandler,
    SaveDatabaseConfigCommandHandler,
    SaveStorageConfigCommandHandler,
    TestDatabaseConnectionCommandHandler,
    TestStorageConnectionCommandHandler,
    UpdateSettingsCommandHandler,
)
from application.settings.queries import (
    GetInfrastructureConfigsQuery,
    GetOllamaModelsQuery,
    GetSettingsQuery,
)
from domain.infrastructure_config.repositories import IInfrastructureConfigRepository
from presentation.api.dependencies import (
    get_infrastructure_config_repo,
    get_ollama_models_handler,
    get_settings_handler,
    get_update_settings_handler,
)

router = APIRouter(prefix="/settings", tags=["Settings & Infrastructure"])


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


class SaveDatabaseRequest(BaseModel):
    provider: str
    name: str
    connection_url: str = ""
    host: str = ""
    port: int = 0
    database_name: str = ""
    username: str = ""
    password: str = ""
    api_key: str = ""
    project_id: str = ""
    ssl_enabled: bool = True


class ActivateInfraProviderRequest(BaseModel):
    provider: str


class TestDatabaseRequest(BaseModel):
    provider: str
    connection_url: str = ""
    host: str = ""
    port: int = 0
    database_name: str = ""
    username: str = ""
    password: str = ""
    api_key: str = ""
    project_id: str = ""
    ssl_enabled: bool = True


class SaveStorageRequest(BaseModel):
    provider: str
    name: str
    base_path: str = "./docs"
    endpoint_url: str = ""
    bucket_name: str = ""
    region: str = "us-east-1"
    access_key: str = ""
    secret_key: str = ""
    project_id: str = ""
    sync_local_mirror: bool = True


class TestStorageRequest(BaseModel):
    provider: str
    base_path: str = "./docs"
    endpoint_url: str = ""
    bucket_name: str = ""
    region: str = "us-east-1"
    access_key: str = ""
    secret_key: str = ""
    project_id: str = ""
    sync_local_mirror: bool = True


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


@router.get("/infrastructure")
async def get_infrastructure_configs(
    repo: IInfrastructureConfigRepository = Depends(get_infrastructure_config_repo),
) -> dict[str, Any]:
    """List all Database and Storage configurations with masked secrets and active status."""
    handler = GetInfrastructureConfigsQueryHandler(repo)
    return await handler.handle(GetInfrastructureConfigsQuery())


@router.post("/database")
async def save_database_config(
    payload: SaveDatabaseRequest,
    repo: IInfrastructureConfigRepository = Depends(get_infrastructure_config_repo),
) -> dict[str, Any]:
    """Save or update a relational or NoSQL Database configuration."""
    handler = SaveDatabaseConfigCommandHandler(repo)
    saved = await handler.handle(
        SaveDatabaseConfigCommand(
            provider=payload.provider,
            name=payload.name,
            connection_url=payload.connection_url,
            host=payload.host,
            port=payload.port,
            database_name=payload.database_name,
            username=payload.username,
            password=payload.password,
            api_key=payload.api_key,
            project_id=payload.project_id,
            ssl_enabled=payload.ssl_enabled,
        )
    )
    return {
        "status": "success",
        "message": f"Configuración de base de datos '{saved.name}' guardada exitosamente.",
        "config": saved.to_dict(mask_secrets=True),
    }


@router.post("/database/activate")
async def activate_database_provider(
    payload: ActivateInfraProviderRequest,
    repo: IInfrastructureConfigRepository = Depends(get_infrastructure_config_repo),
) -> dict[str, Any]:
    """Switch active Database provider (SQLite, PostgreSQL, Supabase, SQL Server, MongoDB, Firebase)."""
    handler = ActivateDatabaseProviderCommandHandler(repo)
    active = await handler.handle(ActivateDatabaseProviderCommand(provider=payload.provider))
    return {
        "status": "success",
        "message": f"Motor de base de datos activo cambiado a {active.name}.",
        "active_database": active.provider.value,
        "config": active.to_dict(mask_secrets=True),
    }


@router.post("/database/test")
async def test_database_connection(
    payload: TestDatabaseRequest,
    repo: IInfrastructureConfigRepository = Depends(get_infrastructure_config_repo),
) -> dict[str, Any]:
    """Test connection and latency for any relational or NoSQL Database provider."""
    handler = TestDatabaseConnectionCommandHandler(repo)
    return await handler.handle(
        TestDatabaseConnectionCommand(
            provider=payload.provider,
            connection_url=payload.connection_url,
            host=payload.host,
            port=payload.port,
            database_name=payload.database_name,
            username=payload.username,
            password=payload.password,
            api_key=payload.api_key,
            project_id=payload.project_id,
            ssl_enabled=payload.ssl_enabled,
        )
    )


@router.post("/storage")
async def save_storage_config(
    payload: SaveStorageRequest,
    repo: IInfrastructureConfigRepository = Depends(get_infrastructure_config_repo),
) -> dict[str, Any]:
    """Save or update a File Storage configuration (Local, Supabase Storage, S3/R2, Firebase)."""
    handler = SaveStorageConfigCommandHandler(repo)
    saved = await handler.handle(
        SaveStorageConfigCommand(
            provider=payload.provider,
            name=payload.name,
            base_path=payload.base_path,
            endpoint_url=payload.endpoint_url,
            bucket_name=payload.bucket_name,
            region=payload.region,
            access_key=payload.access_key,
            secret_key=payload.secret_key,
            project_id=payload.project_id,
            sync_local_mirror=payload.sync_local_mirror,
        )
    )
    return {
        "status": "success",
        "message": f"Configuración de almacenamiento '{saved.name}' guardada exitosamente.",
        "config": saved.to_dict(mask_secrets=True),
    }


@router.post("/storage/activate")
async def activate_storage_provider(
    payload: ActivateInfraProviderRequest,
    repo: IInfrastructureConfigRepository = Depends(get_infrastructure_config_repo),
) -> dict[str, Any]:
    """Switch active File Storage provider."""
    handler = ActivateStorageProviderCommandHandler(repo)
    active = await handler.handle(ActivateStorageProviderCommand(provider=payload.provider))
    return {
        "status": "success",
        "message": f"Almacenamiento de archivos activo cambiado a {active.name}.",
        "active_storage": active.provider.value,
        "config": active.to_dict(mask_secrets=True),
    }


@router.post("/storage/test")
async def test_storage_connection(
    payload: TestStorageRequest,
    repo: IInfrastructureConfigRepository = Depends(get_infrastructure_config_repo),
) -> dict[str, Any]:
    """Test bucket/filesystem connectivity and latency for a Storage provider."""
    handler = TestStorageConnectionCommandHandler(repo)
    return await handler.handle(
        TestStorageConnectionCommand(
            provider=payload.provider,
            base_path=payload.base_path,
            endpoint_url=payload.endpoint_url,
            bucket_name=payload.bucket_name,
            region=payload.region,
            access_key=payload.access_key,
            secret_key=payload.secret_key,
            project_id=payload.project_id,
            sync_local_mirror=payload.sync_local_mirror,
        )
    )


