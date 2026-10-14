"""SQL and Disk Book Registry Repositories."""

from __future__ import annotations

from typing import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from domain.book_registry.entities import Attachment, DraftBook
from domain.book_registry.repositories import IAttachmentRepository, IBookRegistryRepository
from infrastructure.persistence.models.attachment_model import AttachmentORM


class SqlAttachmentRepository(IAttachmentRepository):
    """SQLAlchemy implementation of IAttachmentRepository."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _to_entity(self, orm: AttachmentORM) -> Attachment:
        return Attachment(
            id=orm.id,
            book_id=orm.book_id,
            file_name=orm.file_name,
            file_path=orm.file_path,
            mime_type=orm.mime_type,
            size_bytes=orm.size_bytes,
            uploaded_at=orm.uploaded_at,
        )

    async def save_attachment(self, attachment: Attachment) -> Attachment:
        query = select(AttachmentORM).where(AttachmentORM.id == attachment.id)
        result = await self._session.execute(query)
        orm = result.scalar_one_or_none()
        if orm:
            orm.file_name = attachment.file_name
            orm.file_path = attachment.file_path
            orm.mime_type = attachment.mime_type
            orm.size_bytes = attachment.size_bytes
        else:
            orm = AttachmentORM(
                id=attachment.id,
                book_id=attachment.book_id,
                file_name=attachment.file_name,
                file_path=attachment.file_path,
                mime_type=attachment.mime_type,
                size_bytes=attachment.size_bytes,
                uploaded_at=attachment.uploaded_at,
            )
            self._session.add(orm)
        await self._session.commit()
        return self._to_entity(orm)

    async def get_attachment(self, attachment_id: str) -> Attachment | None:
        query = select(AttachmentORM).where(AttachmentORM.id == attachment_id)
        result = await self._session.execute(query)
        orm = result.scalar_one_or_none()
        if not orm:
            return None
        return self._to_entity(orm)

    async def list_attachments_for_book(self, book_id: str) -> list[Attachment]:
        query = select(AttachmentORM).where(AttachmentORM.book_id == book_id).order_by(AttachmentORM.uploaded_at.desc())
        result = await self._session.execute(query)
        orms: Sequence[AttachmentORM] = result.scalars().all()
        return [self._to_entity(orm) for orm in orms]

    async def delete_attachment(self, attachment_id: str) -> bool:
        query = select(AttachmentORM).where(AttachmentORM.id == attachment_id)
        result = await self._session.execute(query)
        orm = result.scalar_one_or_none()
        if not orm:
            return False
        await self._session.delete(orm)
        await self._session.commit()
        return True


class InMemoryDraftBookRepository(IBookRegistryRepository):
    """Repository storing in-flight drafts for dual editing sessions."""

    def __init__(self) -> None:
        self._drafts: dict[str, DraftBook] = {}

    async def get_draft(self, draft_id: str) -> DraftBook | None:
        return self._drafts.get(draft_id)

    async def save_draft(self, draft: DraftBook) -> DraftBook:
        self._drafts[draft.id] = draft
        return draft

    async def delete_draft(self, draft_id: str) -> bool:
        if draft_id in self._drafts:
            del self._drafts[draft_id]
            return True
        return False
