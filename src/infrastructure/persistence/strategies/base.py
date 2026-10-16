"""Protocol and shared helpers for Database Strategies."""

from __future__ import annotations

import asyncio
from typing import Protocol
from urllib.parse import urlparse
from infrastructure.persistence.strategies.options import DatabaseConnectionOptions


class IDatabaseStrategy(Protocol):
    """Strategy Pattern: Contract for testing reachability, credentials, and drivers of a database provider."""

    async def test_connection(self, options: DatabaseConnectionOptions) -> tuple[bool, str, float]:
        """Verify database reachability and return (success, message, latency_ms)."""
        ...


def extract_host_port(url: str, default_host: str, default_port: int) -> tuple[str, int]:
    """Parse host and port safely from a database connection URL with fallbacks."""
    try:
        normalized = url.split("://", 1)[-1] if "://" in url else url
        parsed = urlparse(f"http://{normalized}")
        return (parsed.hostname or default_host, parsed.port or default_port)
    except Exception:
        return default_host, default_port


async def probe_tcp(host: str, port: int, timeout: float = 3.0) -> tuple[bool, str]:
    """Attempt a raw TCP socket connection to verify network reachability."""
    try:
        conn = asyncio.open_connection(host, port)
        reader, writer = await asyncio.wait_for(conn, timeout=timeout)
        writer.close()
        try:
            await writer.wait_closed()
        except Exception:
            pass
        return True, "OK"
    except Exception as exc:
        return False, str(exc)

