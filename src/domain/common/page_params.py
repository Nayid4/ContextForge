"""Immutable pagination request value object."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class PageParams:
    page: int = 1
    page_size: int = 12

    def normalized(self) -> PageParams:
        safe_page = max(1, self.page)
        safe_size = max(1, min(self.page_size, 100))
        return PageParams(page=safe_page, page_size=safe_size)

    @property
    def offset(self) -> int:
        norm = self.normalized()
        return (norm.page - 1) * norm.page_size
