"""Phase 2 Security schema revision: explicit llm_configurations.egress_class and webhooks.secret_encrypted.

Revision ID: 20261128_0003
Revises: 20261128_0002
Create Date: 2026-11-28 08:30:00
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision: str = "20261128_0003"
down_revision: str | None = "20261128_0002"
branch_labels: str | tuple[str, ...] | None = None
depends_on: str | tuple[str, ...] | None = None


def _has_column(table: str, col: str) -> bool:
    insp = sa.inspect(op.get_bind())
    if table not in insp.get_table_names():
        return True
    return col in {c["name"] for c in insp.get_columns(table)}


def upgrade() -> None:
    if not _has_column("llm_configurations", "egress_class"):
        op.add_column(
            "llm_configurations",
            sa.Column("egress_class", sa.String(length=16), nullable=False, server_default=""),
        )
    if not _has_column("webhooks", "secret_encrypted"):
        op.add_column(
            "webhooks",
            sa.Column("secret_encrypted", sa.Text(), nullable=False, server_default=""),
        )


def downgrade() -> None:
    if _has_column("webhooks", "secret_encrypted"):
        op.drop_column("webhooks", "secret_encrypted")
    if _has_column("llm_configurations", "egress_class"):
        op.drop_column("llm_configurations", "egress_class")
