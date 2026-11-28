"""Project Webhook Subscription ORM model (webhooks table)."""

from __future__ import annotations

from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.persistence.models.base_orm import Base, utc_now


class WebhookORM(Base):
    __tablename__ = "webhooks"
    webhook_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    project_slug: Mapped[str] = mapped_column(String(50), ForeignKey("projects.slug", ondelete="CASCADE"), index=True, nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    events_csv: Mapped[str] = mapped_column(String(300), nullable=False, default="document.published,document.indexed")
    secret: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    secret_encrypted: Mapped[str] = mapped_column(Text, nullable=False, default="")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
