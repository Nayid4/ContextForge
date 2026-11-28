"""Saved Agent Evaluation Test Case ORM model (agent_eval_cases table)."""

from __future__ import annotations

from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.persistence.models.base_orm import Base, utc_now


class AgentEvalCaseORM(Base):
    __tablename__ = "agent_eval_cases"
    case_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    agent_id: Mapped[str] = mapped_column(String(64), ForeignKey("agents.agent_id", ondelete="CASCADE"), index=True, nullable=False)
    project_slug: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    expected_citation_path: Mapped[str] = mapped_column(String(300), nullable=False, default="")
    expected_substring: Mapped[str] = mapped_column(String(300), nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
