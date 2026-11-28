"""Clustered Knowledge Gap ORM model (knowledge_gaps table)."""

from __future__ import annotations

from datetime import datetime
from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.persistence.models.base_orm import Base, utc_now


class KnowledgeGapORM(Base):
    __tablename__ = "knowledge_gaps"
    gap_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    project_slug: Mapped[str] = mapped_column(String(50), index=True, nullable=False, default="default")
    agent_slug: Mapped[str] = mapped_column(String(60), nullable=False, default="")
    question: Mapped[str] = mapped_column(Text, nullable=False)
    topic_cluster: Mapped[str] = mapped_column(String(120), index=True, nullable=False, default="general")
    occurrences: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    status: Mapped[str] = mapped_column(String(20), index=True, nullable=False, default="open")
    assigned_to: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    ignored_reason: Mapped[str] = mapped_column(Text, nullable=False, default="")
    resolved_by_doc_path: Mapped[str] = mapped_column(String(300), nullable=False, default="")
    suggested_module: Mapped[str] = mapped_column(String(100), nullable=False, default="general")
    last_asked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
