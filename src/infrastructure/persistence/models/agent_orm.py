"""Configurable AI Agent ORM model (agents table, scoped to projects)."""

from __future__ import annotations

from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.persistence.models.base_orm import Base, utc_now


class AgentORM(Base):
    __tablename__ = "agents"
    __table_args__ = (UniqueConstraint("project_slug", "slug", name="uq_agents_project_slug"),)

    agent_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    project_slug: Mapped[str] = mapped_column(String(50), ForeignKey("projects.slug", ondelete="CASCADE"), index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(60), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    system_prompt: Mapped[str] = mapped_column(Text, default="")
    llm_provider: Mapped[str] = mapped_column(String(50), default="")
    llm_model: Mapped[str] = mapped_column(String(120), default="")
    temperature: Mapped[float] = mapped_column(Float, default=0.2)
    max_tokens: Mapped[int] = mapped_column(Integer, default=2048)
    top_k: Mapped[int] = mapped_column(Integer, default=6)
    min_grounding_score: Mapped[float] = mapped_column(Float, default=0.15)
    allowed_modules_json: Mapped[str] = mapped_column(Text, default="[]")
    allowed_tags_json: Mapped[str] = mapped_column(Text, default="[]")
    allowed_statuses_json: Mapped[str] = mapped_column(Text, default='["published"]')
    welcome_message: Mapped[str] = mapped_column(Text, default="")
    suggested_questions_json: Mapped[str] = mapped_column(Text, default="[]")
    topic_boundaries: Mapped[str] = mapped_column(Text, default="")
    visibility: Mapped[str] = mapped_column(String(20), default="internal", nullable=False)
    daily_quota_requests: Mapped[int] = mapped_column(Integer, default=500, nullable=False)
    current_version: Mapped[int] = mapped_column(Integer, default=1)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
