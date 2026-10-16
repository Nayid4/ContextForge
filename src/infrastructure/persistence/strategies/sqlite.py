"""SQLite Database Strategy."""

from __future__ import annotations

from pathlib import Path
import time
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from infrastructure.persistence.strategies.options import DatabaseConnectionOptions


class SqliteDatabaseStrategy:
    """Strategy for Local Sovereign SQLite files."""

    async def test_connection(self, options: DatabaseConnectionOptions) -> tuple[bool, str, float]:
        t0 = time.perf_counter()
        url = options.connection_url
        try:
            if "sqlite+aiosqlite:///" in url:
                db_file = url.split("sqlite+aiosqlite:///")[-1]
                if db_file and not db_file.startswith(":memory:"):
                    Path(db_file).parent.mkdir(parents=True, exist_ok=True)
            engine = create_async_engine(url, echo=False)
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            await engine.dispose()
            latency = round((time.perf_counter() - t0) * 1000.0, 2)
            return (
                True,
                f"Motor SQLite Local conectado y verificado exitosamente ({url})",
                latency,
            )
        except Exception as exc:
            latency = round((time.perf_counter() - t0) * 1000.0, 2)
            return False, f"Error en SQLite Local: {str(exc)}", latency

