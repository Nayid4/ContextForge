"""Hexagonal Ports (Interfaces) for Database & File Storage Configurations and Gateways."""

from __future__ import annotations

from abc import ABC, abstractmethod
from domain.infrastructure_config.entities import (
    DatabaseConfiguration,
    DatabaseProvider,
    StorageConfiguration,
    StorageProvider,
)


class IFileStorageGateway(ABC):
    """Hexagonal Port for saving, reading, and testing file storage across Local FS, Supabase, S3, and Firebase."""

    @abstractmethod
    async def save_file(self, relative_path: str, content: bytes, content_type: str = "application/octet-stream") -> str:
        """Persist bytes at relative_path and return canonical URI or path."""

    @abstractmethod
    async def read_file(self, relative_path: str) -> bytes:
        """Read bytes from relative_path."""

    @abstractmethod
    async def delete_file(self, relative_path: str) -> bool:
        """Delete file at relative_path."""

    @abstractmethod
    async def test_connection(self) -> tuple[bool, str, float]:
        """Verify read/write or bucket connectivity and return (healthy, message, latency_ms)."""


class IInfrastructureConfigRepository(ABC):
    """Repository port for managing Database & Storage adapter configurations."""

    @abstractmethod
    async def get_all_databases(self) -> list[DatabaseConfiguration]:
        """Return all registered database configurations."""

    @abstractmethod
    async def get_database_by_provider(self, provider: DatabaseProvider) -> DatabaseConfiguration | None:
        """Return configuration for a specific database provider."""

    @abstractmethod
    async def get_active_database(self) -> DatabaseConfiguration:
        """Return the currently active database configuration."""

    @abstractmethod
    async def save_database(self, config: DatabaseConfiguration) -> DatabaseConfiguration:
        """Persist or update a database configuration."""

    @abstractmethod
    async def activate_database(self, provider: DatabaseProvider) -> DatabaseConfiguration:
        """Set the specified database provider as active."""

    @abstractmethod
    async def get_all_storages(self) -> list[StorageConfiguration]:
        """Return all registered storage configurations."""

    @abstractmethod
    async def get_storage_by_provider(self, provider: StorageProvider) -> StorageConfiguration | None:
        """Return configuration for a specific storage provider."""

    @abstractmethod
    async def get_active_storage(self) -> StorageConfiguration:
        """Return the currently active storage configuration."""

    @abstractmethod
    async def save_storage(self, config: StorageConfiguration) -> StorageConfiguration:
        """Persist or update a storage configuration."""

    @abstractmethod
    async def activate_storage(self, provider: StorageProvider) -> StorageConfiguration:
        """Set the specified storage provider as active."""

