"""Phase 1 Team Mode schema revision: add users.must_change_password for forced password rotation on bootstrap.

Revision ID: 20261128_0002
Revises: 20261128_0001
Create Date: 2026-11-28 08:00:00
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision: str = "20261128_0002"
down_revision: str | None = "20261128_0001"
branch_labels: str | tuple[str, ...] | None = None
depends_on: str | tuple[str, ...] | None = None


def _has_column(table: str, col: str) -> bool:
    insp = sa.inspect(op.get_bind())
    if table not in insp.get_table_names():
        return True
    return col in {c["name"] for c in insp.get_columns(table)}


def upgrade() -> None:
    if not _has_column("users", "must_change_password"):
        op.add_column(
            "users",
            sa.Column("must_change_password", sa.Boolean(), nullable=False, server_default=sa.false()),
        )


def downgrade() -> None:
    if _has_column("users", "must_change_password"):
        op.drop_column("users", "must_change_password")
