"""Scoped RAG/Agent Chat Session ORM model linked to optional agent_id & agent_version."""

from __future__ import annotations

from datetime import datetime
from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.persistence.models.base_orm import Base, utc_now


class ChatSessionORM(Base):
    __tablename__ = "chat_sessions"
    session_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    project_slug: Mapped[str] = mapped_column(String(50), index=True, nullable=False, default="default")
    book_id: Mapped[str | None] = mapped_column(String(180), nullable=True)
    user_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    agent_id: Mapped[str | None] = mapped_column(String(64), index=True, nullable=True, default=None)
    agent_version: Mapped[int | None] = mapped_column(Integer, nullable=True, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
