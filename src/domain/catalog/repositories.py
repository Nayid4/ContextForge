"""Catalog Domain Repository Interfaces."""

from __future__ import annotations

from typing import Protocol
from domain.catalog.entities import Book, Library


class ILibraryRepository(Protocol):
    """Repository protocol for Library persistence and querying."""

    async def get_by_slug(self, slug: str) -> Library | None:
        ...

    async def list_all(self) -> list[Library]:
        ...

    async def get_active(self) -> Library | None:
        ...

    async def save(self, library: Library) -> Library:
        ...

    async def set_active(self, slug: str) -> bool:
        ...

    async def delete(self, slug: str) -> bool:
        ...


class IBookRepository(Protocol):
    """Repository protocol for Book / Document persistence and querying."""

    async def get_by_id(self, book_id: str) -> Book | None:
        ...

    async def get_by_path(self, library_slug: str, relative_path: str) -> Book | None:
        ...

    async def list_by_library(self, library_slug: str) -> list[Book]:
        ...

    async def list_all(self) -> list[Book]:
        ...

    async def save(self, book: Book) -> Book:
        ...

    async def delete(self, book_id: str) -> bool:
        ...
