"""UploadAttachment response DTO."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class UploadAttachmentResponse:
    """Response DTO for UploadAttachmentCommand."""

    attachment_id: str
    file_name: str
    file_path: str
    mime_type: str
    size_bytes: int
    is_image: bool
    message: str = ""

