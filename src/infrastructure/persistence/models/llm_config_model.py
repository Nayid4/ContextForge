"""LLM Configuration ORM Model."""

from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from infrastructure.persistence.models.base_model import Base


class LLMConfigORM(Base):
    """ORM representation for Multi-LLM & Local CLI provider configurations."""

    __tablename__ = "llm_configurations"

    provider: Mapped[str] = mapped_column(String(50), primary_key=True)
    engine_type: Mapped[str] = mapped_column(String(50), nullable=False, default="local_http")
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    api_key: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    base_url: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    default_model: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    cli_command: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    cli_args: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    temperature: Mapped[float] = mapped_column(Float, nullable=False, default=0.2)
    max_tokens: Mapped[int] = mapped_column(Integer, nullable=False, default=4096)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
