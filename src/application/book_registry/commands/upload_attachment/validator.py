"""Validator for UploadAttachmentCommand."""

from __future__ import annotations

from application.book_registry.commands.upload_attachment.command import (
    UploadAttachmentCommand,
)
from application.commons.exceptions.application_exceptions import ValidationException

MAX_ATTACHMENT_SIZE = 50 * 1024 * 1024  # 50 MB


class UploadAttachmentValidator:
    """Validates uploaded attachment attributes and boundaries."""

    def validate(self, command: UploadAttachmentCommand) -> None:
        if not command.library_id or not command.library_id.strip():
            raise ValidationException("Library ID cannot be empty.")
        if not command.doc_name or not command.doc_name.strip():
            raise ValidationException("Document name cannot be empty.")
        if not command.file_name or not command.file_name.strip():
            raise ValidationException("File name cannot be empty.")
        if not command.content_bytes:
            raise ValidationException("Uploaded file cannot be empty.")
        if len(command.content_bytes) > MAX_ATTACHMENT_SIZE:
            raise ValidationException("Attachment exceeds maximum allowed size of 50MB.")

