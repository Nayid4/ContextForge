"""Local Sovereign FileSystem Storage Strategy (Docs-as-Code)."""

from __future__ import annotations

from pathlib import Path
from domain.infrastructure_config.entities import StorageConfiguration
from infrastructure.storage.strategies.base import BaseFileStorageAdapter
from infrastructure.storage.strategies.options import StorageOptions


class LocalFileStorageAdapter(BaseFileStorageAdapter):
    """Sovereign Local FileSystem Storage Strategy (Docs-as-Code default)."""

    def __init__(self, config_or_options: StorageConfiguration | StorageOptions | str = "./docs") -> None:
        super().__init__(config_or_options)
        self._base_path = Path(self.options.base_path or "./docs")

    async def _do_save(self, clean_rel: str, content: bytes, content_type: str) -> str:
        target = self._base_path / clean_rel
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content)
        return str(target)

    async def _do_read(self, clean_rel: str) -> bytes:
        target = self._base_path / clean_rel
        return target.read_bytes()

    async def _do_delete(self, clean_rel: str) -> bool:
        target = self._base_path / clean_rel
        if target.exists():
            target.unlink()
            return True
        return False

    async def _do_test(self) -> tuple[bool, str]:
        self._base_path.mkdir(parents=True, exist_ok=True)
        md_count = len(list(self._base_path.rglob("*.md")))
        return (
            True,
            f"Almacenamiento Local Soberano activo en '{self._base_path.resolve()}' ({md_count} archivos .md detectados)",
        )

