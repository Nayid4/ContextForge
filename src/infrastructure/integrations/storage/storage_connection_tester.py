"""Diagnostic tester for Local FS, AWS S3, Supabase Storage, and Firebase Storage."""

from __future__ import annotations

from pathlib import Path
import time


class StorageConnectionTester:
    @staticmethod
    async def test_storage(
        *,
        provider: str,
        base_path: str = "./data/storage",
        endpoint_url: str = "",
        bucket_name: str = "",
        project_id: str = "",
    ) -> tuple[bool, str, float]:
        t0 = time.perf_counter()
        prov = provider.strip().lower()
        if prov in ("local", "local_fs"):
            try:
                p = Path(base_path or "./data/storage").resolve()
                p.mkdir(parents=True, exist_ok=True)
                probe = p / ".cf_write_probe"
                probe.write_text("ok", encoding="utf-8")
                probe.unlink(missing_ok=True)
                return True, f"Almacenamiento local operativo en {p.as_posix()}", round((time.perf_counter() - t0) * 1000.0, 2)
            except Exception as exc:
                return False, f"Error de escritura en directorio local: {exc}", round((time.perf_counter() - t0) * 1000.0, 2)

        if not bucket_name.strip() and not endpoint_url.strip() and not project_id.strip():
            return False, f"Faltan credenciales/bucket para validar el proveedor '{prov}'.", round((time.perf_counter() - t0) * 1000.0, 2)
        return True, f"Configuración de proveedor '{prov}' validada estructuralmente.", round((time.perf_counter() - t0) * 1000.0, 2)
