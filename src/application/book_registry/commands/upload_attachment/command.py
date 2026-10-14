"""UploadAttachment command definition."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class UploadAttachmentCommand:
    """Command to upload a local attachment and persist in sovereign assets directory."""

    library_id: str
    doc_name: str
    file_name: str
    content_bytes: bytes
    mime_type: str

