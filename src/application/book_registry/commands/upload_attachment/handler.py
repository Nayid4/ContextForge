"""Handler for UploadAttachmentCommand."""

from __future__ import annotations

from pathlib import Path
import uuid
from application.book_registry.commands.upload_attachment.command import (
    UploadAttachmentCommand,
)
from application.book_registry.commands.upload_attachment.response import (
    UploadAttachmentResponse,
)
from application.book_registry.commands.upload_attachment.validator import (
    UploadAttachmentValidator,
)
from domain.book_registry.entities import Attachment
from domain.book_registry.repositories import IAttachmentRepository


class UploadAttachmentHandler:
    """Stores uploaded file into sovereign assets directory and records metadata."""

    def __init__(
        self,
        attachment_repo: IAttachmentRepository,
        docs_base_path: str = "./docs",
    ) -> None:
        self._attachment_repo = attachment_repo
        self._docs_base_path = Path(docs_base_path)
        self._validator = UploadAttachmentValidator()

    async def handle(self, command: UploadAttachmentCommand) -> UploadAttachmentResponse:
        self._validator.validate(command)
        clean_doc_name = command.doc_name.removesuffix(".md").strip()
        assets_dir = self._docs_base_path / command.library_id / "assets" / clean_doc_name
        assets_dir.mkdir(parents=True, exist_ok=True)

        target_file = assets_dir / command.file_name
        target_file.write_bytes(command.content_bytes)

        rel_path = f"assets/{clean_doc_name}/{command.file_name}"
        is_image = command.mime_type.startswith("image/") or command.file_name.lower().endswith(
            (".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg")
        )

        attachment = Attachment(
            id=str(uuid.uuid4()),
            book_id=f"{command.library_id}/{clean_doc_name}",
            file_name=command.file_name,
            file_path=rel_path,
            mime_type=command.mime_type,
            size_bytes=len(command.content_bytes),
        )

        saved = await self._attachment_repo.save_attachment(attachment)

        return UploadAttachmentResponse(
            attachment_id=saved.id,
            file_name=saved.file_name,
            file_path=saved.file_path,
            mime_type=saved.mime_type,
            size_bytes=saved.size_bytes,
            is_image=is_image,
            message="Attachment successfully saved to sovereign storage.",
        )

