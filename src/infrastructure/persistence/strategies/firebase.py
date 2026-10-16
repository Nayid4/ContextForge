"""Google Firebase Cloud Firestore Strategy."""

from __future__ import annotations

import time
import httpx
from infrastructure.persistence.strategies.options import DatabaseConnectionOptions


class FirebaseDatabaseStrategy:
    """Strategy for Google Firebase Cloud Firestore."""

    async def test_connection(self, options: DatabaseConnectionOptions) -> tuple[bool, str, float]:
        t0 = time.perf_counter()
        project_id = (options.project_id or "").strip()
        if not project_id:
            latency = round((time.perf_counter() - t0) * 1000.0, 2)
            return (
                False,
                "Ingresa el Project ID de Firebase (ej. mi-proyecto-firebase) para conectar con Cloud Firestore.",
                latency,
            )
        firestore_url = (
            f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents"
        )
        params: dict[str, str | int] = {"pageSize": 1}
        if options.api_key:
            params["key"] = options.api_key
        try:
            async with httpx.AsyncClient(timeout=options.timeout_seconds) as client:
                res = await client.get(firestore_url, params=params)
                latency = round((time.perf_counter() - t0) * 1000.0, 2)
                if res.status_code == 200:
                    return (
                        True,
                        f"Conectado a Google Cloud Firestore (Proyecto: {project_id})",
                        latency,
                    )
                if res.status_code in (401, 403):
                    return (
                        True,
                        f"Proyecto Firebase '{project_id}' detectado en Google Cloud (Reglas de seguridad activas; usa Service Account Token para escritura).",
                        latency,
                    )
                if res.status_code == 404:
                    return (
                        False,
                        f"Proyecto Firebase '{project_id}' o base de datos Firestore '(default)' no encontrada (HTTP 404).",
                        latency,
                    )
                return False, f"Firebase Firestore respondió HTTP {res.status_code}", latency
        except Exception as exc:
            latency = round((time.perf_counter() - t0) * 1000.0, 2)
            return False, f"Error al contactar Firebase Firestore: {str(exc)}", latency

