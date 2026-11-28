"""Idempotent Document Utility Rating ORM model."""

from __future__ import annotations

from datetime import datetime
from sqlalchemy import DateTime, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.persistence.models.base_orm import Base, utc_now


class RatingORM(Base):
    __tablename__ = "ratings"
    __table_args__ = (UniqueConstraint("book_id", "user_identifier", name="uq_rating_book_user"),)
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    book_id: Mapped[str] = mapped_column(String(180), index=True, nullable=False)
    project_slug: Mapped[str] = mapped_column(String(50), nullable=False, default="default")
    user_identifier: Mapped[str] = mapped_column(String(120), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
