"""Bundle Exporter Implementation."""

from __future__ import annotations

import os
from pathlib import Path
import aiofiles
from domain.context_builder.entities import ContextBundle
from domain.context_builder.repositories import IBundleStorageRepository


class LocalBundleExporter(IBundleStorageRepository):
    """Exports and persists compiled Context Bundles into the local filesystem."""

    def __init__(self, base_directory: str = "./bundles") -> None:
        self._dir = Path(base_directory)
        self._dir.mkdir(parents=True, exist_ok=True)
        self._bundles: dict[str, ContextBundle] = {}

    async def save_bundle(self, bundle: ContextBundle) -> str:
        self._dir.mkdir(parents=True, exist_ok=True)
        file_path = self._dir / Path(bundle.file_path).name
        bundle.file_path = str(file_path.as_posix())

        async with aiofiles.open(file_path, mode="w", encoding="utf-8") as f:
            await f.write(bundle.compiled_markdown)

        self._bundles[bundle.id] = bundle
        return bundle.file_path

    async def list_bundles(self) -> list[ContextBundle]:
        return list(self._bundles.values())

    async def get_bundle(self, bundle_id: str) -> ContextBundle | None:
        return self._bundles.get(bundle_id)

