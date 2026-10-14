"""Book Registry Domain Repository Protocols."""

from __future__ import annotations

from typing import Protocol
from domain.book_registry.entities import Attachment, DraftBook


class IBookRegistryRepository(Protocol):
    """Protocol for managing draft books and persistent markdown compositions."""

    async def get_draft(self, draft_id: str) -> DraftBook | None:
        ...

    async def save_draft(self, draft: DraftBook) -> DraftBook:
        ...

    async def delete_draft(self, draft_id: str) -> bool:
        ...


class IAttachmentRepository(Protocol):
    """Protocol for persisting and retrieving local attachments."""

    async def save_attachment(self, attachment: Attachment) -> Attachment:
        ...

    async def get_attachment(self, attachment_id: str) -> Attachment | None:
        ...

    async def list_attachments_for_book(self, book_id: str) -> list[Attachment]:
        ...

    async def delete_attachment(self, attachment_id: str) -> bool:
        ...
