"""SQLAlchemy Async Repository for Documents, Versions & Attachments (DOC)."""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from sqlalchemy import delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from domain.common import PagedResult, PageParams
from domain.documents import (
    AttachmentEntity,
    DocumentAggregate,
    DocumentVersionEntity,
    EditorialStatus,
    IDocumentRepositoryPort,
)
from infrastructure.persistence.models import AttachmentORM, BookORM, DocumentVersionORM, ProjectORM


def _map_doc(r: BookORM) -> DocumentAggregate:
    tags = tuple(t.strip() for t in (r.tags_csv or "").split(",") if t.strip())
    st = EditorialStatus.parse(r.status)
    return DocumentAggregate(
        id=r.id,
        project_slug=r.library_slug,
        slug=r.slug,
        title=r.title,
        path=r.path,
        module_name=r.module_name,
        tags=tags,
        author=r.author,
        summary=r.summary,
        content_markdown=r.content_markdown,
        status=st.value if not st.is_error else EditorialStatus.PUBLISHED,
        is_locked=r.is_locked,
        current_version=r.current_version,
        published_version=getattr(r, "published_version", None),
        content_hash=r.content_hash,
        last_synced_hash=getattr(r, "last_synced_hash", "") or "",
        sync_status=getattr(r, "sync_status", "synced") or "synced",
        steward_user_id=getattr(r, "steward_user_id", "") or "",
        review_interval_days=int(getattr(r, "review_interval_days", 90) or 90),
        last_reviewed_at=getattr(r, "last_reviewed_at", None),
        created_at=r.created_at,
        updated_at=r.updated_at,
    )


def _map_ver(r: DocumentVersionORM) -> DocumentVersionEntity:
    return DocumentVersionEntity(
        version_id=r.version_id,
        book_id=r.book_id,
        version_number=r.version_number,
        content_markdown=r.content_markdown,
        content_hash=r.content_hash,
        author_id=r.author_id,
        status_snapshot=r.status_snapshot,
        change_summary=r.change_summary,
        created_at=r.created_at,
    )


class SqlDocumentRepository(IDocumentRepositoryPort):
    """Dual persistence repository synchronizing relational DB and confined Markdown files on disk."""

    def __init__(self, session_maker: async_sessionmaker[AsyncSession], default_docs_root: str = "./docs") -> None:
        self._sm = session_maker
        self._default_root = default_docs_root

    async def _resolve_project_root(self, session: AsyncSession, project_slug: str) -> Path:
        p = (await session.execute(select(ProjectORM).where(ProjectORM.slug == project_slug))).scalar_one_or_none()
        return Path(p.path if p else self._default_root)

    async def get_by_path(self, path: str, project_slug: str = "default") -> DocumentAggregate | None:
        norm_path = path.strip().replace("\\", "/")
        async with self._sm() as s:
            row = (
                await s.execute(select(BookORM).where(BookORM.library_slug == project_slug, BookORM.path == norm_path))
            ).scalar_one_or_none()
            return _map_doc(row) if row else None

    async def get_by_id(self, doc_id: str) -> DocumentAggregate | None:
        async with self._sm() as s:
            row = (await s.execute(select(BookORM).where(BookORM.id == doc_id))).scalar_one_or_none()
            return _map_doc(row) if row else None

    async def list_paginated(
        self,
        *,
        project_slug: str = "default",
        module_name: str | None = None,
        status: EditorialStatus | None = None,
        search: str | None = None,
        pagination: PageParams = PageParams(),
    ) -> PagedResult[DocumentAggregate]:
        norm = pagination.normalized()
        async with self._sm() as s:
            stmt = select(BookORM).where(BookORM.library_slug == project_slug)
            cnt = select(func.count()).select_from(BookORM).where(BookORM.library_slug == project_slug)
            if module_name and module_name not in ("all", ""):
                stmt = stmt.where(BookORM.module_name == module_name)
                cnt = cnt.where(BookORM.module_name == module_name)
            if status is not None:
                stmt = stmt.where(BookORM.status == status.value)
                cnt = cnt.where(BookORM.status == status.value)
            if search and search.strip():
                q = f"%{search.strip()}%"
                cond = or_(BookORM.title.ilike(q), BookORM.path.ilike(q), BookORM.content_markdown.ilike(q), BookORM.tags_csv.ilike(q))
                stmt = stmt.where(cond)
                cnt = cnt.where(cond)
            total = int((await s.execute(cnt)).scalar_one() or 0)
            rows = (
                await s.execute(stmt.order_by(BookORM.updated_at.desc()).offset(norm.offset).limit(norm.page_size))
            ).scalars().all()
            return PagedResult(items=tuple(_map_doc(r) for r in rows), page=norm.page, page_size=norm.page_size, total_count=total)

    async def list_all(self, *, project_slug: str = "default", only_published: bool = False) -> list[DocumentAggregate]:
        async with self._sm() as s:
            stmt = select(BookORM).where(BookORM.library_slug == project_slug)
            if only_published:
                stmt = stmt.where(BookORM.status == EditorialStatus.PUBLISHED.value)
            rows = (await s.execute(stmt.order_by(BookORM.path.asc()))).scalars().all()
            return [_map_doc(r) for r in rows]

    async def save(
        self,
        document: DocumentAggregate,
        new_version: DocumentVersionEntity | None = None,
        *,
        write_to_disk: bool = True,
    ) -> DocumentAggregate:
        async with self._sm() as s:
            row = (await s.execute(select(BookORM).where(BookORM.id == document.id))).scalar_one_or_none()
            tags_csv = ",".join(document.tags)
            if row is None:
                row = BookORM(
                    id=document.id,
                    library_slug=document.project_slug,
                    module_name=document.module_name,
                    slug=document.slug,
                    title=document.title,
                    path=document.path,
                    author=document.author,
                    tags_csv=tags_csv,
                    summary=document.summary,
                    content_markdown=document.content_markdown,
                    status=document.status.value,
                    is_locked=document.is_locked,
                    current_version=document.current_version,
                    published_version=document.published_version,
                    content_hash=document.content_hash,
                    last_synced_hash=document.last_synced_hash,
                    sync_status=document.sync_status,
                    steward_user_id=document.steward_user_id,
                    review_interval_days=document.review_interval_days,
                    last_reviewed_at=document.last_reviewed_at,
                )
                s.add(row)
            else:
                row.title = document.title
                row.module_name = document.module_name
                row.tags_csv = tags_csv
                row.summary = document.summary
                row.content_markdown = document.content_markdown
                row.status = document.status.value
                row.is_locked = document.is_locked
                row.current_version = document.current_version
                row.published_version = document.published_version
                row.content_hash = document.content_hash
                row.last_synced_hash = document.last_synced_hash
                row.sync_status = document.sync_status
                row.steward_user_id = document.steward_user_id
                row.review_interval_days = document.review_interval_days
                row.last_reviewed_at = document.last_reviewed_at
                row.updated_at = datetime.now(timezone.utc)

            if new_version is not None:
                existing_v = (
                    await s.execute(
                        select(DocumentVersionORM).where(
                            DocumentVersionORM.book_id == document.id,
                            DocumentVersionORM.version_number == new_version.version_number,
                        )
                    )
                ).scalar_one_or_none()
                if existing_v is None:
                    s.add(
                        DocumentVersionORM(
                            version_id=new_version.version_id,
                            book_id=new_version.book_id,
                            version_number=new_version.version_number,
                            content_markdown=new_version.content_markdown,
                            content_hash=new_version.content_hash,
                            author_id=new_version.author_id,
                            status_snapshot=new_version.status_snapshot,
                            change_summary=new_version.change_summary,
                        )
                    )

            if write_to_disk and document.sync_status != "in_conflict":
                root = (await self._resolve_project_root(s, document.project_slug)).resolve()
                target = (root / document.path).resolve()
                if target.is_relative_to(root):
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_text(document.content_markdown, encoding="utf-8")
                    if not document.last_synced_hash:
                        row.last_synced_hash = document.content_hash
                        row.sync_status = "synced"

            await s.commit()
            return _map_doc(row)

    async def delete(self, path: str, project_slug: str = "default") -> bool:
        norm_path = path.strip().replace("\\", "/")
        async with self._sm() as s:
            row = (
                await s.execute(select(BookORM).where(BookORM.library_slug == project_slug, BookORM.path == norm_path))
            ).scalar_one_or_none()
            if row is None:
                return False
            root = (await self._resolve_project_root(s, project_slug)).resolve()
            target = (root / norm_path).resolve()
            if target.is_relative_to(root) and target.exists() and target.is_file():
                target.unlink()
            await s.execute(delete(DocumentVersionORM).where(DocumentVersionORM.book_id == row.id))
            await s.delete(row)
            await s.commit()
            return True

    async def list_versions(self, doc_id: str) -> list[DocumentVersionEntity]:
        async with self._sm() as s:
            rows = (
                await s.execute(
                    select(DocumentVersionORM)
                    .where(DocumentVersionORM.book_id == doc_id)
                    .order_by(DocumentVersionORM.version_number.desc())
                )
            ).scalars().all()
            return [_map_ver(r) for r in rows]

    async def get_version(self, doc_id: str, version_number: int) -> DocumentVersionEntity | None:
        async with self._sm() as s:
            r = (
                await s.execute(
                    select(DocumentVersionORM).where(
                        DocumentVersionORM.book_id == doc_id,
                        DocumentVersionORM.version_number == version_number,
                    )
                )
            ).scalar_one_or_none()
            return _map_ver(r) if r else None

    async def save_attachment(self, attachment: AttachmentEntity) -> AttachmentEntity:
        async with self._sm() as s:
            s.add(
                AttachmentORM(
                    id=attachment.id,
                    book_id=attachment.book_id,
                    project_slug=attachment.project_slug,
                    file_name=attachment.file_name,
                    storage_key=attachment.storage_key,
                    mime_type=attachment.mime_type,
                    size_bytes=attachment.size_bytes,
                    sha256_checksum=attachment.sha256_checksum,
                    extracted_text=attachment.extracted_text,
                )
            )
            await s.commit()
            return attachment

    async def list_attachments(self, book_id: str) -> list[AttachmentEntity]:
        async with self._sm() as s:
            rows = (await s.execute(select(AttachmentORM).where(AttachmentORM.book_id == book_id))).scalars().all()
            return [
                AttachmentEntity(
                    id=r.id,
                    book_id=r.book_id,
                    project_slug=r.project_slug,
                    file_name=r.file_name,
                    storage_key=r.storage_key,
                    mime_type=r.mime_type,
                    size_bytes=r.size_bytes,
                    sha256_checksum=r.sha256_checksum,
                    extracted_text=r.extracted_text,
                    uploaded_at=r.uploaded_at,
                )
                for r in rows
            ]

    async def get_attachment(self, attachment_id: str) -> AttachmentEntity | None:
        async with self._sm() as s:
            r = (await s.execute(select(AttachmentORM).where(AttachmentORM.id == attachment_id))).scalar_one_or_none()
            if r is None:
                return None
            return AttachmentEntity(
                id=r.id,
                book_id=r.book_id,
                project_slug=r.project_slug,
                file_name=r.file_name,
                storage_key=r.storage_key,
                mime_type=r.mime_type,
                size_bytes=r.size_bytes,
                sha256_checksum=r.sha256_checksum,
                extracted_text=r.extracted_text,
                uploaded_at=r.uploaded_at,
            )
