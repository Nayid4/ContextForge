"""Scoped SHA-256 API Key ORM model (supporting publishable origin-locked widget keys)."""

from __future__ import annotations

from datetime import datetime
from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.persistence.models.base_orm import Base, utc_now


class ApiKeyORM(Base):
    __tablename__ = "api_keys"
    key_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    key_prefix: Mapped[str] = mapped_column(String(24), nullable=False)
    key_sha256: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    role_scope: Mapped[str] = mapped_column(String(30), nullable=False, default="AgentClient")
    allowed_projects_csv: Mapped[str] = mapped_column(String(500), nullable=False, default="default")
    is_publishable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    allowed_origins_csv: Mapped[str] = mapped_column(String(1000), nullable=False, default="")
    allowed_agents_csv: Mapped[str] = mapped_column(String(1000), nullable=False, default="")
    daily_quota_requests: Mapped[int] = mapped_column(Integer, nullable=False, default=1000)
    last_used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
