"""Template Method Base Class for File Storage Adapters."""

from __future__ import annotations

from abc import ABC, abstractmethod
import logging
import time
from domain.infrastructure_config.entities import StorageConfiguration, StorageProvider
from domain.infrastructure_config.repositories import IFileStorageGateway
from infrastructure.storage.strategies.options import StorageOptions

logger = logging.getLogger("infrastructure.storage.base")


class BaseFileStorageAdapter(IFileStorageGateway, ABC):
    """Template Method Pattern: Encapsulates common file lifecycle (path sanitization,
    local mirror synchronization, metrics, and error boundaries) while delegating
    provider-specific primitives to subclasses.
    """

    def __init__(self, config_or_options: StorageConfiguration | StorageOptions | str) -> None:
        if isinstance(config_or_options, StorageConfiguration):
            self.options = StorageOptions.from_config(config_or_options)
        elif isinstance(config_or_options, StorageOptions):
            self.options = config_or_options
        else:
            self.options = StorageOptions(
                provider=StorageProvider.LOCAL_FS,
                base_path=str(config_or_options or "./docs"),
            )
        self._mirror: IFileStorageGateway | None = None

    def _get_mirror(self) -> IFileStorageGateway | None:
        """Lazy initialization of Docs-as-Code local mirror adapter."""
        if self.options.provider == StorageProvider.LOCAL_FS:
            return None
        if self._mirror is None:
            from infrastructure.storage.strategies.local import LocalFileStorageAdapter

            self._mirror = LocalFileStorageAdapter(self.options.base_path or "./docs")
        return self._mirror

    def _sanitize_path(self, relative_path: str) -> str:
        """Standardizes paths across Windows/Linux filesystem conventions."""
        return relative_path.lstrip("/\\").replace("\\", "/")

    async def save_file(
        self,
        relative_path: str,
        content: bytes,
        content_type: str = "application/octet-stream",
    ) -> str:
        """Template Method: Sanitize path -> Sync mirror -> Execute provider-specific save."""
        clean_rel = self._sanitize_path(relative_path)
        mirror = self._get_mirror()
        if self.options.sync_local_mirror and mirror is not None:
            try:
                await mirror.save_file(clean_rel, content, content_type)
            except Exception as exc:
                logger.warning("Failed to sync local mirror for %s: %s", clean_rel, exc)

        return await self._do_save(clean_rel, content, content_type)

    async def read_file(self, relative_path: str) -> bytes:
        """Template Method: Sanitize path -> Read from provider -> Fallback to local mirror."""
        clean_rel = self._sanitize_path(relative_path)
        try:
            return await self._do_read(clean_rel)
        except Exception as exc:
            mirror = self._get_mirror()
            if mirror is not None:
                logger.debug("Falling back to local mirror for %s due to: %s", clean_rel, exc)
                return await mirror.read_file(clean_rel)
            raise

    async def delete_file(self, relative_path: str) -> bool:
        """Template Method: Sanitize path -> Delete from mirror -> Delete from provider."""
        clean_rel = self._sanitize_path(relative_path)
        mirror = self._get_mirror()
        if self.options.sync_local_mirror and mirror is not None:
            try:
                await mirror.delete_file(clean_rel)
            except Exception as exc:
                logger.warning("Failed to delete from local mirror %s: %s", clean_rel, exc)

        return await self._do_delete(clean_rel)

    async def test_connection(self) -> tuple[bool, str, float]:
        """Template Method: Measures roundtrip latency and catches exceptions."""
        t0 = time.perf_counter()
        try:
            success, msg = await self._do_test()
            latency = round((time.perf_counter() - t0) * 1000.0, 2)
            return success, msg, latency
        except Exception as exc:
            latency = round((time.perf_counter() - t0) * 1000.0, 2)
            return (
                False,
                f"Error al conectar con {self.options.provider.value}: {str(exc)}",
                latency,
            )

    # Primitive operations to be implemented by concrete strategies:
    @abstractmethod
    async def _do_save(self, clean_rel: str, content: bytes, content_type: str) -> str:
        """Provider-specific persistence primitive."""

    @abstractmethod
    async def _do_read(self, clean_rel: str) -> bytes:
        """Provider-specific read primitive."""

    @abstractmethod
    async def _do_delete(self, clean_rel: str) -> bool:
        """Provider-specific delete primitive."""

    @abstractmethod
    async def _do_test(self) -> tuple[bool, str]:
        """Provider-specific connectivity validation primitive (success, message)."""

