"""Incremental indexing job & Dead-Letter Queue repository port with DB-level pagination."""

from __future__ import annotations

from typing import Protocol

from domain.common import PagedResult, PageParams
from domain.rag.indexing_job_entity import IndexingJobEntity
from domain.rag.indexing_job_status import IndexingJobStatus


class IIndexingJobRepositoryPort(Protocol):
    async def get_last_indexed_hash(self, book_id: str) -> str | None: ...
    async def save_job(self, job: IndexingJobEntity) -> IndexingJobEntity: ...
    async def list_jobs(self, *, project_slug: str | None = None, status: IndexingJobStatus | None = None) -> list[IndexingJobEntity]: ...
    async def list_paginated(
        self,
        *,
        project_slug: str | None = None,
        status: IndexingJobStatus | None = None,
        pagination: PageParams = PageParams(),
    ) -> PagedResult[IndexingJobEntity]: ...
