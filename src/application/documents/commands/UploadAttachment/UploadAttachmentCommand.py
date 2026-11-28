from __future__ import annotations
from dataclasses import dataclass
from application.common import ICommand
from domain.documents import AttachmentEntity

@dataclass(frozen=True)
class UploadAttachmentCommand(ICommand[AttachmentEntity]):
    book_path: str
    file_name: str
    mime_type: str
    content_bytes: bytes
    project_slug: str = "default"
    max_mb: int = 25
