"""Answer Feedback ORM model (answer_feedback table)."""

from __future__ import annotations

from datetime import datetime
from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.persistence.models.base_orm import Base, utc_now


class AnswerFeedbackORM(Base):
    __tablename__ = "answer_feedback"
    feedback_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    project_slug: Mapped[str] = mapped_column(String(50), index=True, nullable=False, default="default")
    agent_slug: Mapped[str] = mapped_column(String(60), index=True, nullable=False, default="")
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer_excerpt: Mapped[str] = mapped_column(Text, nullable=False, default="")
    vote: Mapped[str] = mapped_column(String(10), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False, default="")
    user_id: Mapped[str] = mapped_column(String(64), nullable=False, default="anonymous")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
