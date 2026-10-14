"""GetBooks response DTO."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class GetBooksResponse:
    """Response containing retrieved books."""

    books: list[dict[str, Any]]
    count: int

