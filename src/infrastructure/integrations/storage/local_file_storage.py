"""Confined local storage adapter under data/storage/{category}/{project_slug} (BR-03, BR-16)."""

from __future__ import annotations

import hashlib
from pathlib import Path

from domain.ports import IFileStorageService, StoredFileDescriptor


class LocalFileStorageService(IFileStorageService):
    def __init__(self, base_dir: str = "./data/storage") -> None:
        self._base = Path(base_dir).resolve()
        self._base.mkdir(parents=True, exist_ok=True)

    async def save_bytes(
        self,
        *,
        category: str,
        project_slug: str,
        file_name: str,
        content: bytes,
        mime_type: str,
    ) -> StoredFileDescriptor:
        safe_name = Path(file_name).name
        sha = hashlib.sha256(content).hexdigest()
        rel_key = f"{category}/{project_slug}/{sha[:10]}_{safe_name}"
        dest = (self._base / rel_key).resolve()
        if not dest.is_relative_to(self._base):
            raise PermissionError("Storage path traversal blocked")
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(content)
        return StoredFileDescriptor(
            storage_key=rel_key,
            file_name=safe_name,
            mime_type=mime_type,
            size_bytes=len(content),
            sha256_checksum=sha,
        )

    async def read_bytes(self, storage_key: str) -> bytes:
        target = (self._base / storage_key).resolve()
        if not target.is_relative_to(self._base) or not target.exists():
            raise FileNotFoundError(storage_key)
        return target.read_bytes()

    async def delete(self, storage_key: str) -> bool:
        target = (self._base / storage_key).resolve()
        if target.is_relative_to(self._base) and target.exists():
            target.unlink()
            return True
        return False
