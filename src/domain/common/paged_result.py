"""Generic paginated collection metadata and items."""

from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Generic, TypeVar

T = TypeVar("T")


@dataclass(frozen=True)
class PagedResult(Generic[T]):
    items: tuple[T, ...]
    page: int
    page_size: int
    total_count: int

    @property
    def total_pages(self) -> int:
        return max(1, math.ceil(max(0, self.total_count) / max(1, self.page_size)))

    @property
    def has_prev(self) -> bool:
        return self.page > 1

    @property
    def has_next(self) -> bool:
        return self.page < self.total_pages
