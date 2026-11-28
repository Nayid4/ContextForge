"""Project workspace ORM model."""

from __future__ import annotations

from datetime import datetime
from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.persistence.models.base_orm import Base, utc_now


class ProjectORM(Base):
    __tablename__ = "projects"
    slug: Mapped[str] = mapped_column(String(50), primary_key=True)
    owner_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    path: Mapped[str] = mapped_column(String(255), nullable=False)
    sovereign_only: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    max_quota_mb: Mapped[int] = mapped_column(Integer, nullable=False, default=1024)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
