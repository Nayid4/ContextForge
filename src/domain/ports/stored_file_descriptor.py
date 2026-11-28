"""Stored binary file descriptor returned by File Storage adapters."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class StoredFileDescriptor:
    storage_key: str
    file_name: str
    mime_type: str
    size_bytes: int
    sha256_checksum: str
