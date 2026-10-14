"""Context Builder Domain Repository Interface."""

from __future__ import annotations

from typing import Protocol
from domain.context_builder.entities import ContextBundle


class IBundleStorageRepository(Protocol):
    """Protocol for persisting and retrieving compiled context bundles."""

    async def save_bundle(self, bundle: ContextBundle) -> str:
        ...

    async def list_bundles(self) -> list[ContextBundle]:
        ...

    async def get_bundle(self, bundle_id: str) -> ContextBundle | None:
        ...

