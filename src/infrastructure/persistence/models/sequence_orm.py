"""Atomic sequence counter ORM model."""

from __future__ import annotations

from datetime import datetime
from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.persistence.models.base_orm import Base, utc_now


class SequenceORM(Base):
    __tablename__ = "cf_sequences"
    scope_key: Mapped[str] = mapped_column(String(120), primary_key=True)
    current_value: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
