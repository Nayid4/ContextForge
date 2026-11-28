"""Normalized Document Comment ORM model."""

from __future__ import annotations

from datetime import datetime
from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.persistence.models.base_orm import Base, utc_now


class DocumentCommentORM(Base):
    __tablename__ = "document_comments"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    thread_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    book_id: Mapped[str] = mapped_column(String(180), index=True, nullable=False)
    project_slug: Mapped[str] = mapped_column(String(50), nullable=False)
    author_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False, default="")
    author_name: Mapped[str] = mapped_column(String(100), nullable=False)
    author_email: Mapped[str] = mapped_column(String(150), nullable=False, default="")
    section_anchor: Mapped[str] = mapped_column(String(150), nullable=False, default="")
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
