"""Immutable Document Version snapshot ORM model."""

from __future__ import annotations

from datetime import datetime
from sqlalchemy import DateTime, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.persistence.models.base_orm import Base, utc_now


class DocumentVersionORM(Base):
    __tablename__ = "document_versions"
    __table_args__ = (UniqueConstraint("book_id", "version_number", name="uq_doc_ver_num"),)
    version_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    book_id: Mapped[str] = mapped_column(String(180), index=True, nullable=False)
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    content_markdown: Mapped[str] = mapped_column(Text, nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    author_id: Mapped[str] = mapped_column(String(100), nullable=False)
    status_snapshot: Mapped[str] = mapped_column(String(20), nullable=False)
    change_summary: Mapped[str] = mapped_column(String(250), nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
