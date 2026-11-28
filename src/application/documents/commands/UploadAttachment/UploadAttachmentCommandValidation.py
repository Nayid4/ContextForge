from __future__ import annotations
from application.documents.commands.UploadAttachment.UploadAttachmentCommand import UploadAttachmentCommand
from domain.common import DomainError
from domain.documents import validate_attachment_policy

class UploadAttachmentCommandValidation:
    def validate(self, request: UploadAttachmentCommand) -> list[DomainError]:
        res = validate_attachment_policy(request.file_name, len(request.content_bytes), max_mb=request.max_mb)
        return list(res.errors) if res.is_error else []
