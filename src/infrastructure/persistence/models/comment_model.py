"""Comment, Thread and Rating ORM Models."""

from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from infrastructure.persistence.models.base_model import Base


class CommentORM(Base):
    """ORM representation of comments on documentation and books."""

    __tablename__ = "document_comments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    doc_path: Mapped[str] = mapped_column(String(300), nullable=False, index=True)
    user_name: Mapped[str] = mapped_column(String(100), nullable=False)
    user_email: Mapped[str] = mapped_column(String(150), nullable=False, default="")
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )


# Backward compatibility alias
DocumentCommentModel = CommentORM


class ThreadORM(Base):
    """Discussion thread organizing multiple comments."""

    __tablename__ = "discussion_threads"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    target_id: Mapped[str] = mapped_column(String(300), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class RatingORM(Base):
    """User rating score (1-5) for books and documents."""

    __tablename__ = "ratings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    target_id: Mapped[str] = mapped_column(String(300), nullable=False, index=True)
    user_name: Mapped[str] = mapped_column(String(100), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
