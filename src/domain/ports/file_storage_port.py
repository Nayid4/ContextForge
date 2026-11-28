"""Abstract binary file storage service port (Local FS, S3, Supabase, Firebase)."""

from __future__ import annotations

from typing import Protocol

from domain.ports.stored_file_descriptor import StoredFileDescriptor


class IFileStorageService(Protocol):
    async def save_bytes(
        self,
        *,
        category: str,
        project_slug: str,
        file_name: str,
        content: bytes,
        mime_type: str,
    ) -> StoredFileDescriptor: ...

    async def read_bytes(self, storage_key: str) -> bytes: ...

    async def delete(self, storage_key: str) -> bool: ...
