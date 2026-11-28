"""Automatic schema migrations, incremental ALTERs, indexes & SQLite/PostgreSQL append-only audit triggers (BR-14)."""

from __future__ import annotations

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncEngine
from infrastructure.persistence.models import Base

PERFORMANCE_INDEXES_DDL = (
    "CREATE INDEX IF NOT EXISTS idx_books_proj_status_updated ON books (library_slug, status, updated_at);",
    "CREATE INDEX IF NOT EXISTS idx_audit_proj_created ON audit_logs (project_slug, created_at);",
    "CREATE INDEX IF NOT EXISTS idx_doc_versions_book_ver ON document_versions (book_id, version_number);",
    "CREATE INDEX IF NOT EXISTS idx_agents_proj_slug ON agents (project_slug, slug);",
    "CREATE INDEX IF NOT EXISTS idx_agent_versions_agent_ver ON agent_versions (agent_id, version_number);",
    "CREATE INDEX IF NOT EXISTS idx_project_members_proj_user ON project_members (project_slug, user_id);",
    "CREATE INDEX IF NOT EXISTS idx_chat_sessions_agent ON chat_sessions (agent_id);",
)

SQLITE_APPEND_ONLY_AUDIT_TRIGGERS = (
    """
    CREATE TRIGGER IF NOT EXISTS trg_audit_logs_no_update
    BEFORE UPDATE ON audit_logs
    BEGIN
        SELECT RAISE(ABORT, 'BR-14: audit_logs is strictly append-only (UPDATE forbidden)');
    END;
    """,
    """
    CREATE TRIGGER IF NOT EXISTS trg_audit_logs_no_delete
    BEFORE DELETE ON audit_logs
    BEGIN
        SELECT RAISE(ABORT, 'BR-14: audit_logs is strictly append-only (DELETE forbidden)');
    END;
    """,
)

POSTGRES_APPEND_ONLY_AUDIT_TRIGGERS = (
    """
    CREATE OR REPLACE FUNCTION cf_prevent_audit_log_mutation()
    RETURNS TRIGGER AS $$
    BEGIN
        RAISE EXCEPTION 'BR-14: audit_logs is strictly append-only (UPDATE/DELETE forbidden)';
    END;
    $$ LANGUAGE plpgsql;
    """,
    "DROP TRIGGER IF EXISTS trg_audit_logs_no_update_delete ON audit_logs;",
    """
    CREATE TRIGGER trg_audit_logs_no_update_delete
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION cf_prevent_audit_log_mutation();
    """,
)

SQLITE_INCREMENTAL_COLUMNS: dict[str, tuple[tuple[str, str], ...]] = {
    "api_keys": (
        ("is_publishable", "BOOLEAN NOT NULL DEFAULT 0"),
        ("allowed_origins_csv", "VARCHAR(1000) NOT NULL DEFAULT ''"),
        ("allowed_agents_csv", "VARCHAR(1000) NOT NULL DEFAULT ''"),
        ("daily_quota_requests", "INTEGER NOT NULL DEFAULT 1000"),
        ("last_used_at", "DATETIME NULL"),
    ),
    "agents": (
        ("visibility", "VARCHAR(20) NOT NULL DEFAULT 'internal'"),
        ("daily_quota_requests", "INTEGER NOT NULL DEFAULT 500"),
    ),
    "books": (
        ("published_version", "INTEGER NULL"),
        ("last_synced_hash", "VARCHAR(64) NOT NULL DEFAULT ''"),
        ("sync_status", "VARCHAR(24) NOT NULL DEFAULT 'synced'"),
        ("steward_user_id", "VARCHAR(64) NOT NULL DEFAULT ''"),
        ("review_interval_days", "INTEGER NOT NULL DEFAULT 90"),
        ("last_reviewed_at", "DATETIME NULL"),
    ),
    "chat_sessions": (
        ("agent_id", "VARCHAR(64) NULL"),
        ("agent_version", "INTEGER NULL"),
    ),
    "chat_messages": (
        ("model_name", "VARCHAR(120) NOT NULL DEFAULT ''"),
        ("tokens_used", "INTEGER NOT NULL DEFAULT 0"),
        ("retrieved_chunk_ids_json", "TEXT NOT NULL DEFAULT '[]'"),
    ),
    "document_comments": (
        ("author_id", "VARCHAR(64) NOT NULL DEFAULT ''"),
    ),
    "users": (
        ("must_change_password", "BOOLEAN NOT NULL DEFAULT 0"),
    ),
    "llm_configurations": (
        ("egress_class", "VARCHAR(16) NOT NULL DEFAULT ''"),
    ),
    "webhooks": (
        ("secret_encrypted", "TEXT NOT NULL DEFAULT ''"),
    ),
    "knowledge_gaps": (
        ("assigned_to", "VARCHAR(64) NOT NULL DEFAULT ''"),
        ("ignored_reason", "TEXT NOT NULL DEFAULT ''"),
        ("resolved_by_doc_path", "VARCHAR(300) NOT NULL DEFAULT ''"),
        ("suggested_module", "VARCHAR(100) NOT NULL DEFAULT 'general'"),
    ),
}


async def _apply_sqlite_incremental_columns(conn: AsyncConnection) -> None:
    for table_name, cols in SQLITE_INCREMENTAL_COLUMNS.items():
        existing = {row[1] for row in (await conn.execute(text(f"PRAGMA table_info({table_name});"))).fetchall()}
        for col_name, col_ddl in cols:
            if col_name not in existing:
                await conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {col_ddl};"))


async def run_migrations(engine: AsyncEngine) -> None:
    dialect = engine.dialect.name
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        if dialect == "sqlite":
            await _apply_sqlite_incremental_columns(conn)
            for trg_sql in SQLITE_APPEND_ONLY_AUDIT_TRIGGERS:
                await conn.execute(text(trg_sql))
        elif dialect == "postgresql":
            for pg_sql in POSTGRES_APPEND_ONLY_AUDIT_TRIGGERS:
                await conn.execute(text(pg_sql))

        for ddl in PERFORMANCE_INDEXES_DDL:
            await conn.execute(text(ddl))
