"""MongoDB NoSQL Document Repository Adapter for Catalog Entities (Hexagonal Port Implementation)."""

from __future__ import annotations

from typing import Any
from domain.catalog.entities import Book, Library
from domain.catalog.repositories import IBookRepository, ILibraryRepository


class MongoBookRepository(IBookRepository):
    """MongoDB asynchronous adapter implementing IBookRepository."""

    def __init__(self, database: Any) -> None:
        self._col = database["books"]

    async def save(self, book: Book) -> Book:
        doc = {
            "_id": str(book.id),
            "slug": book.slug,
            "title": book.title,
            "library_slug": book.library_slug,
            "module_name": book.module_name,
            "path": book.path,
            "summary": book.summary,
            "tags": list(book.tags),
            "status": book.status,
        }
        await self._col.replace_one({"_id": str(book.id)}, doc, upsert=True)
        return book

    async def get_by_id(self, book_id: str) -> Book | None:
        doc = await self._col.find_one({"_id": str(book_id)})
        if not doc:
            return None
        return Book(
            id=str(doc["_id"]),
            slug=str(doc.get("slug", "")),
            title=str(doc.get("title", "Untitled")),
            library_slug=str(doc.get("library_slug", "default")),
            module_name=str(doc.get("module_name", "general")),
            path=str(doc.get("path", "")),
            summary=str(doc.get("summary", "")),
            tags=list(doc.get("tags", [])),
            status=str(doc.get("status", "published")),
        )

    async def get_by_path(self, library_slug: str, relative_path: str) -> Book | None:
        doc = await self._col.find_one({"library_slug": library_slug, "path": relative_path})
        if not doc:
            return None
        return await self.get_by_id(str(doc["_id"]))

    async def list_by_library(self, library_slug: str) -> list[Book]:
        cursor = self._col.find({"library_slug": library_slug})
        results: list[Book] = []
        async for doc in cursor:
            book = await self.get_by_id(str(doc["_id"]))
            if book:
                results.append(book)
        return results

    async def list_all(self) -> list[Book]:
        cursor = self._col.find({})
        results: list[Book] = []
        async for doc in cursor:
            book = await self.get_by_id(str(doc["_id"]))
            if book:
                results.append(book)
        return results

    async def delete(self, book_id: str) -> bool:
        res = await self._col.delete_one({"_id": str(book_id)})
        return bool(res.deleted_count > 0)


class MongoLibraryRepository(ILibraryRepository):
    """MongoDB asynchronous adapter implementing ILibraryRepository."""

    def __init__(self, database: Any) -> None:
        self._col = database["libraries"]

    async def save(self, library: Library) -> Library:
        doc = {
            "_id": str(library.slug),
            "slug": library.slug,
            "name": library.name,
            "description": library.description,
            "path": library.path,
            "is_active": library.is_active,
        }
        await self._col.replace_one({"_id": str(library.slug)}, doc, upsert=True)
        return library

    async def get_by_slug(self, slug: str) -> Library | None:
        doc = await self._col.find_one({"_id": slug})
        if not doc:
            return None
        return Library(
            slug=str(doc.get("slug", slug)),
            name=str(doc.get("name", slug)),
            description=str(doc.get("description", "")),
            path=str(doc.get("path", f"./docs/{slug}")),
            is_active=bool(doc.get("is_active", False)),
        )

    async def get_active(self) -> Library | None:
        doc = await self._col.find_one({"is_active": True})
        if not doc:
            return None
        return await self.get_by_slug(str(doc["_id"]))

    async def list_all(self) -> list[Library]:
        cursor = self._col.find({})
        items: list[Library] = []
        async for doc in cursor:
            lib = await self.get_by_slug(str(doc["_id"]))
            if lib:
                items.append(lib)
        return items

    async def set_active(self, slug: str) -> bool:
        await self._col.update_many({}, {"$set": {"is_active": False}})
        res = await self._col.update_one({"_id": slug}, {"$set": {"is_active": True}})
        return bool(res.modified_count > 0)

    async def delete(self, slug: str) -> bool:
        res = await self._col.delete_one({"_id": slug})
        return bool(res.deleted_count > 0)

