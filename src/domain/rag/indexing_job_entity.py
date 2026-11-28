"""Asynchronous incremental indexing job with retry counter and DLQ support (RF-RAG-001)."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
import uuid

from domain.rag.indexing_job_status import IndexingJobStatus


@dataclass
class IndexingJobEntity:
    job_id: str
    book_id: str
    project_slug: str
    path: str
    content_hash: str
    status: IndexingJobStatus = IndexingJobStatus.PENDING
    attempts: int = 0
    max_attempts: int = 3
    chunks_indexed: int = 0
    error_detail: str = ""
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    @classmethod
    def create(cls, *, book_id: str, project_slug: str, path: str, content_hash: str, max_attempts: int = 3) -> IndexingJobEntity:
        return cls(
            job_id=str(uuid.uuid4()),
            book_id=book_id,
            project_slug=project_slug,
            path=path,
            content_hash=content_hash,
            max_attempts=max_attempts,
        )

    def mark_completed(self, chunks_count: int) -> None:
        self.status = IndexingJobStatus.COMPLETED
        self.chunks_indexed = chunks_count
        self.error_detail = ""
        self.updated_at = datetime.now(timezone.utc)

    def record_failure(self, reason: str) -> None:
        self.attempts += 1
        self.error_detail = reason[:500]
        if self.attempts >= self.max_attempts:
            self.status = IndexingJobStatus.DEAD_LETTER
        self.updated_at = datetime.now(timezone.utc)
