"""Factory selecting active IFileStorageService adapter."""

from __future__ import annotations

from domain.ports import IFileStorageService
from infrastructure.integrations.storage.local_file_storage import LocalFileStorageService
from infrastructure.options import StorageOptions


class FileStorageFactory:
    @staticmethod
    def create(options: StorageOptions) -> IFileStorageService:
        return LocalFileStorageService(base_dir=options.local_storage_path)
