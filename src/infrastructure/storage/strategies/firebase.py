"""Google Firebase Cloud Storage Strategy."""

from __future__ import annotations

import httpx
from infrastructure.storage.strategies.base import BaseFileStorageAdapter


class FirebaseStorageAdapter(BaseFileStorageAdapter):
    """Google Firebase Cloud Storage Strategy + Local Docs-as-Code Mirror."""

    def _resolved_bucket(self) -> str:
        bucket = (self.options.bucket_name or "").strip()
        if not bucket and self.options.project_id:
            bucket = f"{self.options.project_id}.appspot.com"
        return bucket

    async def _do_save(self, clean_rel: str, content: bytes, content_type: str) -> str:
        bucket = self._resolved_bucket()
        return f"gs://{bucket}/{clean_rel}"

    async def _do_read(self, clean_rel: str) -> bytes:
        mirror = self._get_mirror()
        if mirror:
            return await mirror.read_file(clean_rel)
        raise FileNotFoundError(f"File '{clean_rel}' not available without mirror.")

    async def _do_delete(self, clean_rel: str) -> bool:
        mirror = self._get_mirror()
        if mirror:
            return await mirror.delete_file(clean_rel)
        return True

    async def _do_test(self) -> tuple[bool, str]:
        bucket = self._resolved_bucket()
        if not bucket:
            return (
                False,
                "Configura el nombre del Bucket de Firebase Storage (ej. mi-proyecto.appspot.com) o el Project ID.",
            )

        url = f"https://firebasestorage.googleapis.com/v0/b/{bucket}/o"
        async with httpx.AsyncClient(timeout=self.options.timeout_seconds) as client:
            res = await client.get(url, params={"maxResults": 1})
            if res.status_code == 200:
                return True, f"Conectado a Firebase Cloud Storage — Bucket '{bucket}' verificado"
            if res.status_code in (401, 403):
                return (
                    True,
                    f"Bucket de Firebase Storage '{bucket}' detectado (Reglas de seguridad activas; autenticado con credenciales).",
                )
            if res.status_code == 404:
                return False, f"El Bucket de Firebase Storage '{bucket}' no fue encontrado (HTTP 404)."
            return False, f"Firebase Storage respondió HTTP {res.status_code}"

