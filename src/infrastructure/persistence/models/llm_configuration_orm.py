"""Multi-LLM Provider Configuration ORM model."""

from __future__ import annotations

from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.persistence.models.base_orm import Base, utc_now


class LlmConfigurationORM(Base):
    __tablename__ = "llm_configurations"
    provider: Mapped[str] = mapped_column(String(50), primary_key=True)
    engine_type: Mapped[str] = mapped_column(String(40), nullable=False, default="local_http")
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    base_url: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    api_key_encrypted: Mapped[str] = mapped_column(Text, nullable=False, default="")
    default_model: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    cli_command: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    cli_args: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    temperature: Mapped[float] = mapped_column(Float, nullable=False, default=0.2)
    max_tokens: Mapped[int] = mapped_column(Integer, nullable=False, default=4096)
    egress_class: Mapped[str] = mapped_column(String(16), nullable=False, default="")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
