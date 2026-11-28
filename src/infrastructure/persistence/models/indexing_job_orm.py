"""Incremental Indexing Job & DLQ ORM model."""

from __future__ import annotations

from datetime import datetime
from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.persistence.models.base_orm import Base, utc_now


class IndexingJobORM(Base):
    __tablename__ = "indexing_jobs"
    job_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    book_id: Mapped[str] = mapped_column(String(180), index=True, nullable=False)
    project_slug: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    path: Mapped[str] = mapped_column(String(300), nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[str] = mapped_column(String(20), index=True, nullable=False, default="PENDING")
    attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    chunks_indexed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    error_detail: Mapped[str] = mapped_column(Text, nullable=False, default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
