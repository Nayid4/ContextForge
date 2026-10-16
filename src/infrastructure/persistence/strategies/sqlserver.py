"""Microsoft SQL Server / Azure SQL Database Strategy."""

from __future__ import annotations

import time
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from infrastructure.persistence.strategies.base import extract_host_port, probe_tcp
from infrastructure.persistence.strategies.options import DatabaseConnectionOptions


class SqlServerDatabaseStrategy:
    """Strategy for Microsoft SQL Server / Azure SQL connections."""

    async def test_connection(self, options: DatabaseConnectionOptions) -> tuple[bool, str, float]:
        t0 = time.perf_counter()
        effective_url = options.connection_url
        host, port = extract_host_port(
            effective_url,
            default_host=options.host or "localhost",
            default_port=options.port or 1433,
        )
        if not host or host in ("tu-servidor.database.windows.net",):
            latency = round((time.perf_counter() - t0) * 1000.0, 2)
            return (
                False,
                f"Configura el Host real o la Cadena de Conexión para {options.name}.",
                latency,
            )

        try:
            engine = create_async_engine(effective_url, echo=False)
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            await engine.dispose()
            latency = round((time.perf_counter() - t0) * 1000.0, 2)
            return (
                True,
                f"Conectado a {options.name} ({host}:{port}/{options.database_name}) vía SQLAlchemy",
                latency,
            )
        except ModuleNotFoundError as mod_err:
            tcp_ok, tcp_msg = await probe_tcp(host, port)
            latency = round((time.perf_counter() - t0) * 1000.0, 2)
            driver_pkg = "aioodbc / pyodbc"
            if tcp_ok:
                return (
                    True,
                    f"Servidor {host}:{port} alcanzable por red. (Nota: instala '{driver_pkg}' en .venv para consultas directas: {mod_err.name})",
                    latency,
                )
            return (
                False,
                f"No se pudo conectar a {host}:{port} ({tcp_msg}) y falta el driver Python '{driver_pkg}'.",
                latency,
            )
        except Exception as exc:
            latency = round((time.perf_counter() - t0) * 1000.0, 2)
            return False, f"Error de conexión a {options.name}: {str(exc)[:180]}", latency

