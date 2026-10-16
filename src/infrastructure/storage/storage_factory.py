"""Hexagonal File Storage Factory using Strategy, Options, and Registry Patterns."""

from __future__ import annotations

import logging
from domain.infrastructure_config.entities import StorageConfiguration, StorageProvider
from domain.infrastructure_config.repositories import IFileStorageGateway
from infrastructure.storage.strategies import (
    BaseFileStorageAdapter,
    FirebaseStorageAdapter,
    LocalFileStorageAdapter,
    S3StorageAdapter,
    StorageOptions,
    SupabaseStorageAdapter,
)

logger = logging.getLogger("infrastructure.storage.factory")


class StorageFactory:
    """Hexagonal Factory to instantiate IFileStorageGateway implementations using registered strategies."""

    _REGISTRY: dict[StorageProvider, type[BaseFileStorageAdapter]] = {
        StorageProvider.LOCAL_FS: LocalFileStorageAdapter,
        StorageProvider.SUPABASE_STORAGE: SupabaseStorageAdapter,
        StorageProvider.S3: S3StorageAdapter,
        StorageProvider.FIREBASE_STORAGE: FirebaseStorageAdapter,
    }

    @classmethod
    def register_adapter(
        cls,
        provider: StorageProvider,
        adapter_cls: type[BaseFileStorageAdapter],
    ) -> None:
        """Register or extend an adapter strategy for a given StorageProvider (Open/Closed Principle)."""
        cls._REGISTRY[provider] = adapter_cls
        logger.info("Registered storage adapter for %s: %s", provider, adapter_cls.__name__)

    @classmethod
    def create_gateway(cls, config: StorageConfiguration) -> IFileStorageGateway:
        """Instantiate the concrete storage adapter matching the configuration."""
        options = StorageOptions.from_config(config)
        adapter_cls = cls._REGISTRY.get(options.provider, LocalFileStorageAdapter)
        return adapter_cls(options)


__all__ = [
    "BaseFileStorageAdapter",
    "FirebaseStorageAdapter",
    "LocalFileStorageAdapter",
    "S3StorageAdapter",
    "StorageFactory",
    "StorageOptions",
    "SupabaseStorageAdapter",
]
