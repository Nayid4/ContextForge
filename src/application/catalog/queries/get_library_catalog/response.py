"""GetLibraryCatalog response DTO."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class GetLibraryCatalogResponse:
    """Response containing libraries list and currently active library."""

    libraries: list[dict[str, Any]]
    active_library: dict[str, Any] | None
