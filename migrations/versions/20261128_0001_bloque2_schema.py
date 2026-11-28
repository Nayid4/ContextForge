"""Bloque 2 schema revision: BR-20 sync conflict columns, published_version, agent-chat telemetry, key last_used_at, comment author_id.

Revision ID: 20261128_0001
Revises: None
Create Date: 2026-11-28 06:30:00
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision: str = "20261128_0001"
down_revision: str | None = None
branch_labels: str | tuple[str, ...] | None = None
depends_on: str | tuple[str, ...] | None = None


def _has_column(table: str, col: str) -> bool:
    insp = sa.inspect(op.get_bind())
    if table not in insp.get_table_names():
        return True
    return col in {c["name"] for c in insp.get_columns(table)}


def upgrade() -> None:
    additions: list[tuple[str, sa.Column[object]]] = [
        ("books", sa.Column("published_version", sa.Integer(), nullable=True)),
        ("books", sa.Column("last_synced_hash", sa.String(length=64), nullable=False, server_default="")),
        ("books", sa.Column("sync_status", sa.String(length=24), nullable=False, server_default="synced")),
        ("chat_sessions", sa.Column("agent_id", sa.String(length=64), nullable=True)),
        ("chat_sessions", sa.Column("agent_version", sa.Integer(), nullable=True)),
        ("chat_messages", sa.Column("model_name", sa.String(length=120), nullable=False, server_default="")),
        ("chat_messages", sa.Column("tokens_used", sa.Integer(), nullable=False, server_default="0")),
        ("chat_messages", sa.Column("retrieved_chunk_ids_json", sa.Text(), nullable=False, server_default="[]")),
        ("api_keys", sa.Column("allowed_agents_csv", sa.String(length=1000), nullable=False, server_default="")),
        ("api_keys", sa.Column("daily_quota_requests", sa.Integer(), nullable=False, server_default="1000")),
        ("api_keys", sa.Column("last_used_at", sa.DateTime(timezone=True), nullable=True)),
        ("agents", sa.Column("visibility", sa.String(length=20), nullable=False, server_default="internal")),
        ("agents", sa.Column("daily_quota_requests", sa.Integer(), nullable=False, server_default="500")),
        ("document_comments", sa.Column("author_id", sa.String(length=64), nullable=False, server_default="")),
    ]
    for table, column in additions:
        if not _has_column(table, str(column.name)):
            op.add_column(table, column)


def downgrade() -> None:
    pass
