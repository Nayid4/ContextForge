"""Firebase Cloud Firestore NoSQL Document Repository Adapter for Catalog Entities (Hexagonal Port)."""

from __future__ import annotations

from typing import Any
from domain.catalog.entities import Book, Library
from domain.catalog.repositories import IBookRepository, ILibraryRepository


class FirebaseBookRepository(IBookRepository):
    """Firebase Firestore adapter implementing IBookRepository."""

    def __init__(self, firestore_client: Any) -> None:
        self._db = firestore_client

    async def save(self, book: Book) -> Book:
        doc_ref = self._db.collection("books").document(str(book.id))
        doc_ref.set(book.to_dict())
        return book

    async def get_by_id(self, book_id: str) -> Book | None:
        doc = self._db.collection("books").document(str(book_id)).get()
        if not doc.exists:
            return None
        data = doc.to_dict() or {}
        return Book(
            id=str(data.get("id", book_id)),
            slug=str(data.get("slug", "")),
            title=str(data.get("title", "Untitled")),
            library_slug=str(data.get("library_slug", "default")),
            module_name=str(data.get("module_name", "general")),
            path=str(data.get("path", "")),
            summary=str(data.get("summary", "")),
            tags=list(data.get("tags", [])),
            status=str(data.get("status", "published")),
        )

    async def get_by_path(self, library_slug: str, relative_path: str) -> Book | None:
        docs = (
            self._db.collection("books")
            .where("library_slug", "==", library_slug)
            .where("path", "==", relative_path)
            .limit(1)
            .stream()
        )
        for d in docs:
            return await self.get_by_id(str(d.id))
        return None

    async def list_by_library(self, library_slug: str) -> list[Book]:
        docs = self._db.collection("books").where("library_slug", "==", library_slug).stream()
        items: list[Book] = []
        for d in docs:
            b = await self.get_by_id(str(d.id))
            if b:
                items.append(b)
        return items

    async def list_all(self) -> list[Book]:
        docs = self._db.collection("books").stream()
        items: list[Book] = []
        for d in docs:
            b = await self.get_by_id(str(d.id))
            if b:
                items.append(b)
        return items

    async def delete(self, book_id: str) -> bool:
        self._db.collection("books").document(str(book_id)).delete()
        return True


class FirebaseLibraryRepository(ILibraryRepository):
    """Firebase Firestore adapter implementing ILibraryRepository."""

    def __init__(self, firestore_client: Any) -> None:
        self._db = firestore_client

    async def save(self, library: Library) -> Library:
        self._db.collection("libraries").document(library.slug).set(library.to_dict())
        return library

    async def get_by_slug(self, slug: str) -> Library | None:
        doc = self._db.collection("libraries").document(slug).get()
        if not doc.exists:
            return None
        data = doc.to_dict() or {}
        return Library(
            slug=str(data.get("slug", slug)),
            name=str(data.get("name", slug)),
            description=str(data.get("description", "")),
            path=str(data.get("path", f"./docs/{slug}")),
            is_active=bool(data.get("is_active", False)),
        )

    async def get_active(self) -> Library | None:
        docs = self._db.collection("libraries").where("is_active", "==", True).limit(1).stream()
        for d in docs:
            return await self.get_by_slug(str(d.id))
        return None

    async def list_all(self) -> list[Library]:
        docs = self._db.collection("libraries").stream()
        items: list[Library] = []
        for d in docs:
            lib = await self.get_by_slug(str(d.id))
            if lib:
                items.append(lib)
        return items

    async def set_active(self, slug: str) -> bool:
        for d in self._db.collection("libraries").stream():
            self._db.collection("libraries").document(str(d.id)).update({"is_active": str(d.id) == slug})
        return True

    async def delete(self, slug: str) -> bool:
        self._db.collection("libraries").document(slug).delete()
        return True

