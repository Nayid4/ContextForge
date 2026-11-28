"""SQLAlchemy Async Repository for Incremental Indexing Jobs & DLQ with real DB pagination."""

from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from domain.common import PagedResult, PageParams
from domain.rag import IIndexingJobRepositoryPort, IndexingJobEntity, IndexingJobStatus
from infrastructure.persistence.models import IndexingJobORM


def _map_job(r: IndexingJobORM) -> IndexingJobEntity:
    return IndexingJobEntity(
        job_id=r.job_id,
        book_id=r.book_id,
        project_slug=r.project_slug,
        path=r.path,
        content_hash=r.content_hash,
        status=IndexingJobStatus(r.status),
        attempts=r.attempts,
        chunks_indexed=r.chunks_indexed,
        error_detail=r.error_detail,
        updated_at=r.updated_at,
    )


class SqlIndexingJobRepository(IIndexingJobRepositoryPort):
    def __init__(self, session_maker: async_sessionmaker[AsyncSession]) -> None:
        self._sm = session_maker

    async def get_last_indexed_hash(self, book_id: str) -> str | None:
        async with self._sm() as s:
            r = (
                await s.execute(
                    select(IndexingJobORM)
                    .where(IndexingJobORM.book_id == book_id, IndexingJobORM.status == "COMPLETED")
                    .order_by(IndexingJobORM.updated_at.desc())
                    .limit(1)
                )
            ).scalar_one_or_none()
            return r.content_hash if r else None

    async def save_job(self, job: IndexingJobEntity) -> IndexingJobEntity:
        async with self._sm() as s:
            existing = (await s.execute(select(IndexingJobORM).where(IndexingJobORM.job_id == job.job_id))).scalar_one_or_none()
            if existing is None:
                s.add(
                    IndexingJobORM(
                        job_id=job.job_id,
                        book_id=job.book_id,
                        project_slug=job.project_slug,
                        path=job.path,
                        content_hash=job.content_hash,
                        status=job.status.value,
                        attempts=job.attempts,
                        chunks_indexed=job.chunks_indexed,
                        error_detail=job.error_detail,
                    )
                )
            else:
                existing.status = job.status.value
                existing.attempts = job.attempts
                existing.chunks_indexed = job.chunks_indexed
                existing.error_detail = job.error_detail
            await s.commit()
            return job

    async def list_jobs(
        self,
        *,
        project_slug: str | None = None,
        status: IndexingJobStatus | None = None,
    ) -> list[IndexingJobEntity]:
        async with self._sm() as s:
            stmt = select(IndexingJobORM)
            if project_slug:
                stmt = stmt.where(IndexingJobORM.project_slug == project_slug)
            if status:
                stmt = stmt.where(IndexingJobORM.status == status.value)
            rows = (await s.execute(stmt.order_by(IndexingJobORM.updated_at.desc()).limit(100))).scalars().all()
            return [_map_job(r) for r in rows]

    async def list_paginated(
        self,
        *,
        project_slug: str | None = None,
        status: IndexingJobStatus | None = None,
        pagination: PageParams = PageParams(),
    ) -> PagedResult[IndexingJobEntity]:
        norm = pagination.normalized()
        async with self._sm() as s:
            stmt = select(IndexingJobORM)
            cnt = select(func.count()).select_from(IndexingJobORM)
            if project_slug:
                stmt = stmt.where(IndexingJobORM.project_slug == project_slug)
                cnt = cnt.where(IndexingJobORM.project_slug == project_slug)
            if status:
                stmt = stmt.where(IndexingJobORM.status == status.value)
                cnt = cnt.where(IndexingJobORM.status == status.value)
            total = int((await s.execute(cnt)).scalar_one() or 0)
            rows = (
                await s.execute(stmt.order_by(IndexingJobORM.updated_at.desc()).offset(norm.offset).limit(norm.page_size))
            ).scalars().all()
            return PagedResult(items=tuple(_map_job(r) for r in rows), page=norm.page, page_size=norm.page_size, total_count=total)
