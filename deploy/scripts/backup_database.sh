#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./data/backups}"
DB_PROVIDER="${DB_PROVIDER:-sqlite}"
SQLITE_PATH="${SQLITE_PATH:-./data/database/contextforge.db}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"

mkdir -p "$BACKUP_DIR"

if [[ "$DB_PROVIDER" == "sqlite" ]]; then
    if [[ -f "$SQLITE_PATH" ]]; then
        sqlite3 "$SQLITE_PATH" ".backup '$BACKUP_DIR/contextforge_${TIMESTAMP}.db'"
        echo "[Backup OK] SQLite WAL snapshot: $BACKUP_DIR/contextforge_${TIMESTAMP}.db"
    else
        echo "[Backup SKIP] SQLite database file not found at $SQLITE_PATH"
    fi
elif [[ "$DB_PROVIDER" == "postgresql" ]]; then
    pg_dump "${DATABASE_URL_SYNC:?DATABASE_URL_SYNC required}" | gzip > "$BACKUP_DIR/contextforge_pg_${TIMESTAMP}.sql.gz"
    echo "[Backup OK] PostgreSQL dump: $BACKUP_DIR/contextforge_pg_${TIMESTAMP}.sql.gz"
fi
