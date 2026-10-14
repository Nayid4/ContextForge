"""GetLibraryCatalog query definition."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class GetLibraryCatalogQuery:
    """Query to list registered libraries/projects and identify active library."""

    library_slug: str | None = None
