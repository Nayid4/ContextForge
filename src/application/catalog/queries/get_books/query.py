"""GetBooks query definition."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class GetBooksQuery:
    """Query to list books, optionally filtered by library / project slug."""

    library_slug: str | None = None

