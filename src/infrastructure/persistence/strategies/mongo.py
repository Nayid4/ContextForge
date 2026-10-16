"""MongoDB Database Strategy."""

from __future__ import annotations

import time
from urllib.parse import urlparse
from infrastructure.persistence.strategies.base import extract_host_port, probe_tcp
from infrastructure.persistence.strategies.options import DatabaseConnectionOptions


class MongoDatabaseStrategy:
    """Strategy for MongoDB and MongoDB Atlas clusters."""

    async def test_connection(self, options: DatabaseConnectionOptions) -> tuple[bool, str, float]:
        t0 = time.perf_counter()
        effective_url = options.connection_url

        if effective_url.startswith("mongodb+srv://"):
            parsed = urlparse(effective_url)
            srv_host = parsed.hostname or options.host
            latency = round((time.perf_counter() - t0) * 1000.0, 2)
            if not srv_host:
                return False, "Especifica el clúster en la URI mongodb+srv://", latency
            return (
                True,
                f"URI de MongoDB Atlas validada ({srv_host} / DB: {options.database_name})",
                latency,
            )

        host, port = extract_host_port(
            effective_url,
            default_host=options.host or "localhost",
            default_port=options.port or 27017,
        )
        tcp_ok, tcp_msg = await probe_tcp(host, port)
        latency = round((time.perf_counter() - t0) * 1000.0, 2)
        if tcp_ok:
            return (
                True,
                f"Conectado al servidor MongoDB en {host}:{port} (Base de datos: {options.database_name})",
                latency,
            )
        return (
            False,
            f"No se pudo establecer conexión con MongoDB en {host}:{port} ({tcp_msg}). Verifica que mongod esté activo.",
            latency,
        )

