"""Settings ORM Model for ContextForge."""

from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy import DateTime, Float, String
from sqlalchemy.orm import Mapped, mapped_column
from infrastructure.persistence.models.base_model import Base


class SettingsModel(Base):
    """System settings for ContextForge."""

    __tablename__ = "settings"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default="default")
    active_llm_model: Mapped[str] = mapped_column(String(100), nullable=False, default="llama3.1:8b")
    ollama_url: Mapped[str] = mapped_column(String(200), nullable=False, default="http://localhost:11434")
    docs_path: Mapped[str] = mapped_column(String(200), nullable=False, default="./docs")
    embedding_model: Mapped[str] = mapped_column(String(100), nullable=False, default="nomic-embed-text")
    temperature: Mapped[float] = mapped_column(Float, nullable=False, default=0.2)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
