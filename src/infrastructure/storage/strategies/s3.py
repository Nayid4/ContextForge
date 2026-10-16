"""AWS S3 / MinIO / Cloudflare R2 Storage Strategy."""

from __future__ import annotations

import httpx
from infrastructure.storage.strategies.base import BaseFileStorageAdapter


class S3StorageAdapter(BaseFileStorageAdapter):
    """AWS S3 / MinIO / Cloudflare R2 Storage Strategy + Local Docs-as-Code Mirror."""

    async def _do_save(self, clean_rel: str, content: bytes, content_type: str) -> str:
        return f"s3://{self.options.bucket_name}/{clean_rel}"

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
        if not self.options.access_key or not self.options.secret_key or not self.options.bucket_name:
            return (
                False,
                "Configura Access Key ID, Secret Access Key y el nombre del Bucket S3 / MinIO / R2.",
            )

        endpoint = (
            self.options.endpoint_url.strip().rstrip("/")
            if self.options.endpoint_url
            else f"https://s3.{self.options.region or 'us-east-1'}.amazonaws.com"
        )
        async with httpx.AsyncClient(timeout=self.options.timeout_seconds) as client:
            res = await client.head(f"{endpoint}/{self.options.bucket_name}")
            if res.status_code in (200, 301, 307, 400, 403):
                return (
                    True,
                    f"Endpoint S3-Compatible alcanzable en '{endpoint}' para bucket '{self.options.bucket_name}' (HTTP {res.status_code})",
                )
            if res.status_code == 404:
                return (
                    False,
                    f"El bucket '{self.options.bucket_name}' no existe en el endpoint '{endpoint}' (HTTP 404).",
                )
            return False, f"Respuesta inesperada de S3 ({res.status_code})"

