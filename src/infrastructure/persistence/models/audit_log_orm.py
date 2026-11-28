"""Append-only SHA-256 hash-chained Audit Log ORM model (RF-COL-004, BR-14)."""

from __future__ import annotations

from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.persistence.models.base_orm import Base, utc_now


class AuditLogORM(Base):
    __tablename__ = "audit_logs"
    seq: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    log_id: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    actor_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    role: Mapped[str] = mapped_column(String(30), nullable=False)
    project_slug: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    operation: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    resource_id: Mapped[str] = mapped_column(String(150), nullable=False)
    succeeded: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    latency_ms: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    prev_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    entry_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    client_ip: Mapped[str] = mapped_column(String(64), nullable=False, default="local")
    error_code: Mapped[str | None] = mapped_column(String(80), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
