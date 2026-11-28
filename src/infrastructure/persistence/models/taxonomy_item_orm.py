"""Project taxonomy (Modules & Tags) ORM model."""

from __future__ import annotations

from datetime import datetime
from sqlalchemy import DateTime, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.persistence.models.base_orm import Base, utc_now


class TaxonomyItemORM(Base):
    __tablename__ = "taxonomy_items"
    __table_args__ = (UniqueConstraint("project_slug", "kind", "slug", name="uq_taxonomy_proj_kind_slug"),)
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    project_slug: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    kind: Mapped[str] = mapped_column(String(16), nullable=False, default="module")
    slug: Mapped[str] = mapped_column(String(100), nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    color: Mapped[str] = mapped_column(String(30), nullable=False, default="indigo")
    icon: Mapped[str] = mapped_column(String(40), nullable=False, default="folder")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
