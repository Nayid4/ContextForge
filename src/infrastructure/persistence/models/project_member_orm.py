"""Project-scoped RBAC membership ORM model (project_members)."""

from __future__ import annotations

from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.persistence.models.base_orm import Base, utc_now


class ProjectMemberORM(Base):
    __tablename__ = "project_members"
    __table_args__ = (UniqueConstraint("project_slug", "user_id", name="uq_project_member"),)

    member_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    project_slug: Mapped[str] = mapped_column(String(50), ForeignKey("projects.slug", ondelete="CASCADE"), index=True, nullable=False)
    user_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.user_id", ondelete="CASCADE"), index=True, nullable=False)
    role: Mapped[str] = mapped_column(String(30), nullable=False, default="Consumer")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
