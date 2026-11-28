"""Knowledge Document (Book) ORM model."""

from __future__ import annotations

from datetime import datetime
from sqlalchemy import Boolean, DateTime, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.persistence.models.base_orm import Base, utc_now


class BookORM(Base):
    __tablename__ = "books"
    __table_args__ = (UniqueConstraint("library_slug", "path", name="uq_books_project_path"),)
    id: Mapped[str] = mapped_column(String(180), primary_key=True)
    library_slug: Mapped[str] = mapped_column(String(50), index=True, nullable=False, default="default")
    module_name: Mapped[str] = mapped_column(String(100), index=True, nullable=False, default="general")
    slug: Mapped[str] = mapped_column(String(120), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    path: Mapped[str] = mapped_column(String(300), nullable=False)
    author: Mapped[str] = mapped_column(String(100), nullable=False, default="system")
    tags_csv: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    summary: Mapped[str] = mapped_column(Text, nullable=False, default="")
    content_markdown: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[str] = mapped_column(String(20), index=True, nullable=False, default="published")
    is_locked: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    current_version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    published_version: Mapped[int | None] = mapped_column(Integer, nullable=True, default=None)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    last_synced_hash: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    sync_status: Mapped[str] = mapped_column(String(24), nullable=False, default="synced")
    steward_user_id: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    review_interval_days: Mapped[int] = mapped_column(Integer, nullable=False, default=90)
    last_reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
