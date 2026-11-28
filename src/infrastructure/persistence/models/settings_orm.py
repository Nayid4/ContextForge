"""Global System Settings ORM model."""

from __future__ import annotations

from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, String
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.persistence.models.base_orm import Base, utc_now


class SettingsORM(Base):
    __tablename__ = "settings"
    id: Mapped[str] = mapped_column(String(50), primary_key=True, default="default")
    active_llm_model: Mapped[str] = mapped_column(String(100), nullable=False, default="llama3.1:8b")
    ollama_url: Mapped[str] = mapped_column(String(200), nullable=False, default="http://127.0.0.1:11434")
    docs_path: Mapped[str] = mapped_column(String(200), nullable=False, default="./docs")
    embedding_model: Mapped[str] = mapped_column(String(100), nullable=False, default="nomic-embed-text")
    temperature: Mapped[float] = mapped_column(Float, nullable=False, default=0.2)
    min_grounding_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.15)
    enable_dlp_redaction: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    enable_extractive_fallback: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
