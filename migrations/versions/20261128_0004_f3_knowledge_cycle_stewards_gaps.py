"""Phase 3 Knowledge Cycle schema revision: document stewards/freshness and knowledge_gaps lifecycle columns (BR-24).

Revision ID: 20261128_0004
Revises: 20261128_0003
Create Date: 2026-11-28 09:00:00
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision: str = "20261128_0004"
down_revision: str | None = "20261128_0003"
branch_labels: str | tuple[str, ...] | None = None
depends_on: str | tuple[str, ...] | None = None


def _has_column(table: str, col: str) -> bool:
    insp = sa.inspect(op.get_bind())
    if table not in insp.get_table_names():
        return True
    return col in {c["name"] for c in insp.get_columns(table)}


def upgrade() -> None:
    additions: list[tuple[str, sa.Column[object]]] = [
        ("books", sa.Column("steward_user_id", sa.String(length=64), nullable=False, server_default="")),
        ("books", sa.Column("review_interval_days", sa.Integer(), nullable=False, server_default="90")),
        ("books", sa.Column("last_reviewed_at", sa.DateTime(timezone=True), nullable=True)),
        ("knowledge_gaps", sa.Column("assigned_to", sa.String(length=64), nullable=False, server_default="")),
        ("knowledge_gaps", sa.Column("ignored_reason", sa.Text(), nullable=False, server_default="")),
        ("knowledge_gaps", sa.Column("resolved_by_doc_path", sa.String(length=300), nullable=False, server_default="")),
        ("knowledge_gaps", sa.Column("suggested_module", sa.String(length=100), nullable=False, server_default="general")),
    ]
    for table, col in additions:
        if not _has_column(table, str(col.name)):
            op.add_column(table, col)


def downgrade() -> None:
    for table, col in (
        ("knowledge_gaps", "suggested_module"),
        ("knowledge_gaps", "resolved_by_doc_path"),
        ("knowledge_gaps", "ignored_reason"),
        ("knowledge_gaps", "assigned_to"),
        ("books", "last_reviewed_at"),
        ("books", "review_interval_days"),
        ("books", "steward_user_id"),
    ):
        if _has_column(table, col):
            op.drop_column(table, col)
