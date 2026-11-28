"""Multi-engine SQLAlchemy Async Factory with SQLite WAL & Connection Diagnostics (RF-CFG-001, RNF-14)."""

from __future__ import annotations
import asyncio
from pathlib import Path
import time
from typing import Any
from urllib.parse import urlparse

from sqlalchemy import event, text
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from infrastructure.options import DatabaseOptions


def create_async_db_engine(options: DatabaseOptions) -> AsyncEngine:
    url = options.database_url
    if "sqlite" in url and "///" in url:
        raw_path = url.split("///", 1)[-1]
        if raw_path and not raw_path.startswith(":memory:"):
            Path(raw_path).parent.mkdir(parents=True, exist_ok=True)
        engine = create_async_engine(url, echo=False)

        @event.listens_for(engine.sync_engine, "connect")
        def _configure_sqlite_wal(dbapi_conn: Any, _record: Any) -> None:
            cursor = dbapi_conn.cursor()
            cursor.execute("PRAGMA journal_mode=WAL;")
            cursor.execute("PRAGMA synchronous=NORMAL;")
            cursor.execute(f"PRAGMA busy_timeout={options.busy_timeout_ms};")
            cursor.execute("PRAGMA foreign_keys=ON;")
            cursor.close()

        return engine

    return create_async_engine(url, echo=False, pool_size=options.pool_size, pool_pre_ping=True)


def create_session_maker(engine: AsyncEngine) -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


class DatabaseConnectionTester:
    """Polygot database diagnostic strategy (SQLite, PostgreSQL, SQL Server, MySQL, MongoDB, Firebase)."""

    @staticmethod
    async def test_connection(provider: str, connection_url: str, host: str = "", port: int | None = None, timeout: float = 5.0) -> tuple[bool, str, float]:
        t0 = time.perf_counter()
        prov = provider.strip().lower()
        if prov == "sqlite":
            try:
                eng = create_async_db_engine(DatabaseOptions(db_provider="sqlite", database_url=connection_url or "sqlite+aiosqlite:///:memory:"))
                async with eng.connect() as conn:
                    await conn.execute(text("SELECT 1"))
                await eng.dispose()
                return True, "Motor SQLite WAL verificado exitosamente.", round((time.perf_counter() - t0) * 1000.0, 2)
            except Exception as exc:
                return False, f"Fallo en SQLite: {exc}", round((time.perf_counter() - t0) * 1000.0, 2)

        eff_host = host
        eff_port = port
        if not eff_host and connection_url:
            norm = connection_url.split("://", 1)[-1]
            parsed = urlparse(f"http://{norm}")
            eff_host = parsed.hostname or "127.0.0.1"
            eff_port = eff_port or parsed.port

        default_ports = {"postgresql": 5432, "supabase": 5432, "sqlserver": 1433, "mysql": 3306, "mongodb": 27017, "firebase": 443}
        target_host = eff_host or ("firestore.googleapis.com" if prov == "firebase" else "127.0.0.1")
        target_port = eff_port or default_ports.get(prov, 5432)

        try:
            conn_coro = asyncio.open_connection(target_host, target_port)
            _r, writer = await asyncio.wait_for(conn_coro, timeout=timeout)
            writer.close()
            try:
                await writer.wait_closed()
            except Exception:
                pass
            return True, f"Conectividad TCP verificada hacia {prov} ({target_host}:{target_port}).", round((time.perf_counter() - t0) * 1000.0, 2)
        except Exception as exc:
            return False, f"No se alcanzó {prov} en {target_host}:{target_port}: {exc}", round((time.perf_counter() - t0) * 1000.0, 2)
