"""Binary document attachment entity with SHA-256 checksum and extracted text (RF-DOC-005)."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass(frozen=True)
class AttachmentEntity:
    id: str
    book_id: str
    project_slug: str
    file_name: str
    storage_key: str
    mime_type: str
    size_bytes: int
    sha256_checksum: str
    extracted_text: str = ""
    uploaded_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
