"""Supabase Database Strategy."""

from __future__ import annotations

import time
import httpx
from infrastructure.persistence.strategies.options import DatabaseConnectionOptions
from infrastructure.persistence.strategies.postgres import PostgresDatabaseStrategy


class SupabaseDatabaseStrategy:
    """Strategy for Supabase (REST API or PostgreSQL direct connection)."""

    async def test_connection(self, options: DatabaseConnectionOptions) -> tuple[bool, str, float]:
        t0 = time.perf_counter()
        raw_url = (options.connection_url or "").strip()

        # If user provided https://<ref>.supabase.co, test PostgREST health
        if raw_url.startswith("https://") and ".supabase.co" in raw_url:
            if not options.api_key:
                latency = round((time.perf_counter() - t0) * 1000.0, 2)
                return (
                    False,
                    "Para conectar con Supabase vía HTTPS REST, ingresa tu Supabase Anon / Service Role API Key.",
                    latency,
                )
            rest_url = f"{raw_url.rstrip('/')}/rest/v1/"
            headers = {
                "apikey": options.api_key,
                "Authorization": f"Bearer {options.api_key}",
            }
            try:
                async with httpx.AsyncClient(timeout=options.timeout_seconds) as client:
                    res = await client.get(rest_url, headers=headers)
                    latency = round((time.perf_counter() - t0) * 1000.0, 2)
                    if res.status_code in (200, 204):
                        return (
                            True,
                            f"Conectado exitosamente a Supabase BaaS ({raw_url})",
                            latency,
                        )
                    return (
                        False,
                        f"Supabase respondió HTTP {res.status_code}: verifica tu API Key o Project URL.",
                        latency,
                    )
            except Exception as exc:
                latency = round((time.perf_counter() - t0) * 1000.0, 2)
                return False, f"Error de red al conectar con Supabase: {str(exc)}", latency

        # Otherwise fallback to PostgreSQL direct strategy
        return await PostgresDatabaseStrategy().test_connection(options)

