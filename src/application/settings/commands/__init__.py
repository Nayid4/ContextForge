"""Settings Commands Package."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class UpdateSettingsCommand:
    """Command to update active LLM model and system configuration."""

    active_llm_model: str
    ollama_url: str = "http://localhost:11434"
    docs_path: str = "./docs"
    embedding_model: str = "nomic-embed-text"
    temperature: float = 0.2


@dataclass(frozen=True)
class SaveLLMConfigCommand:
    """Command to save or update an LLM provider configuration."""

    provider: str
    name: str
    api_key: str = ""
    base_url: str = ""
    default_model: str = ""
    temperature: float = 0.2
    max_tokens: int = 4096
    engine_type: str = ""
    cli_command: str = ""
    cli_args: str = ""


@dataclass(frozen=True)
class ActivateLLMProviderCommand:
    """Command to activate an LLM provider and deactivate others."""

    provider: str


@dataclass(frozen=True)
class TestLLMConnectionCommand:
    """Command to test connection and latency with an LLM provider."""

    __test__ = False

    provider: str
    api_key: str = ""
    base_url: str = ""
    default_model: str = ""
    engine_type: str = ""
    cli_command: str = ""
    cli_args: str = ""


@dataclass(frozen=True)
class SaveDatabaseConfigCommand:
    """Command to save or update a Database provider configuration."""

    provider: str
    name: str = ""
    connection_url: str = ""
    host: str = ""
    port: int = 0
    database_name: str = ""
    username: str = ""
    password: str = ""
    api_key: str = ""
    project_id: str = ""
    ssl_enabled: bool = False


@dataclass(frozen=True)
class ActivateDatabaseProviderCommand:
    """Command to switch the active Database provider."""

    provider: str


@dataclass(frozen=True)
class TestDatabaseConnectionCommand:
    """Command to test connection with a Database provider."""

    __test__ = False

    provider: str
    connection_url: str = ""
    host: str = ""
    port: int = 0
    database_name: str = ""
    username: str = ""
    password: str = ""
    api_key: str = ""
    project_id: str = ""
    ssl_enabled: bool = False


@dataclass(frozen=True)
class SaveStorageConfigCommand:
    """Command to save or update a File Storage provider configuration."""

    provider: str
    name: str = ""
    base_path: str = "./docs"
    endpoint_url: str = ""
    bucket_name: str = ""
    region: str = ""
    access_key: str = ""
    secret_key: str = ""
    project_id: str = ""
    sync_local_mirror: bool = True


@dataclass(frozen=True)
class ActivateStorageProviderCommand:
    """Command to switch the active File Storage provider."""

    provider: str


@dataclass(frozen=True)
class TestStorageConnectionCommand:
    """Command to test connection with a File Storage provider."""

    __test__ = False

    provider: str
    base_path: str = "./docs"
    endpoint_url: str = ""
    bucket_name: str = ""
    region: str = ""
    access_key: str = ""
    secret_key: str = ""
    project_id: str = ""
    sync_local_mirror: bool = True


__all__ = [
    "ActivateDatabaseProviderCommand",
    "ActivateLLMProviderCommand",
    "ActivateStorageProviderCommand",
    "SaveDatabaseConfigCommand",
    "SaveLLMConfigCommand",
    "SaveStorageConfigCommand",
    "TestDatabaseConnectionCommand",
    "TestLLMConnectionCommand",
    "TestStorageConnectionCommand",
    "UpdateSettingsCommand",
]
