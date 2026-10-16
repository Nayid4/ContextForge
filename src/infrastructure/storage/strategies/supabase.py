"""Supabase Storage Strategy via REST API."""

from __future__ import annotations

import httpx
from domain.infrastructure_config.entities import StorageConfiguration
from infrastructure.storage.strategies.base import BaseFileStorageAdapter
from infrastructure.storage.strategies.options import StorageOptions


class SupabaseStorageAdapter(BaseFileStorageAdapter):
    """Supabase Storage Bucket Strategy via REST API + Local Mirror."""

    def __init__(self, config_or_options: StorageConfiguration | StorageOptions) -> None:
        super().__init__(config_or_options)
        self._endpoint = self.options.endpoint_url.strip().rstrip("/")
        self._bucket = self.options.bucket_name.strip() or "contextforge-docs"
        self._api_key = self.options.secret_key.strip() or self.options.access_key.strip()

    def _headers(self, content_type: str = "application/json") -> dict[str, str]:
        return {
            "apikey": self._api_key,
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": content_type,
        }

    async def _do_save(self, clean_rel: str, content: bytes, content_type: str) -> str:
        url = f"{self._endpoint}/storage/v1/object/{self._bucket}/{clean_rel}"
        async with httpx.AsyncClient(timeout=self.options.timeout_seconds) as client:
            headers = self._headers(content_type)
            headers["x-upsert"] = "true"
            res = await client.post(url, headers=headers, content=content)
            res.raise_for_status()
        return f"supabase://{self._bucket}/{clean_rel}"

    async def _do_read(self, clean_rel: str) -> bytes:
        url = f"{self._endpoint}/storage/v1/object/{self._bucket}/{clean_rel}"
        async with httpx.AsyncClient(timeout=self.options.timeout_seconds) as client:
            res = await client.get(url, headers=self._headers())
            if res.status_code == 200:
                return res.content
        raise FileNotFoundError(f"File '{clean_rel}' not found in Supabase bucket '{self._bucket}'")

    async def _do_delete(self, clean_rel: str) -> bool:
        url = f"{self._endpoint}/storage/v1/object/{self._bucket}/{clean_rel}"
        async with httpx.AsyncClient(timeout=self.options.timeout_seconds) as client:
            res = await client.delete(url, headers=self._headers())
            return res.status_code in (200, 204)

    async def _do_test(self) -> tuple[bool, str]:
        if not self._endpoint or not self._api_key:
            return (
                False,
                "Configura la URL del Proyecto Supabase (https://<ref>.supabase.co) y la Service Role / Anon Key.",
            )
        url = f"{self._endpoint}/storage/v1/bucket/{self._bucket}"
        async with httpx.AsyncClient(timeout=self.options.timeout_seconds) as client:
            res = await client.get(url, headers=self._headers())
            if res.status_code == 200:
                return True, f"Conectado a Supabase Storage — Bucket '{self._bucket}' listo"
            if res.status_code in (400, 404):
                list_res = await client.get(f"{self._endpoint}/storage/v1/bucket", headers=self._headers())
                if list_res.status_code == 200:
                    return (
                        True,
                        f"Autenticado en Supabase Storage correctamente (Nota: el bucket '{self._bucket}' aún no ha sido creado en tu panel).",
                    )
            return False, f"Supabase Storage respondió HTTP {res.status_code}: {res.text[:140]}"

