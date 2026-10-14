"""Catalog DTO Mappers."""

from __future__ import annotations

from typing import Any
from domain.catalog.entities import Book, Library


class CatalogMapper:
    """Transforms Catalog domain entities to structured dictionaries and DTOs."""

    @staticmethod
    def library_to_dto(library: Library) -> dict[str, Any]:
        return {
            "slug": library.slug,
            "name": library.name,
            "description": library.description,
            "path": library.path,
            "is_active": library.is_active,
            "created_at": library.created_at.isoformat(),
            "updated_at": library.updated_at.isoformat(),
        }

    @staticmethod
    def book_to_dto(book: Book) -> dict[str, Any]:
        return {
            "id": book.id,
            "slug": book.slug,
            "title": book.title,
            "library_slug": book.library_slug,
            "module_name": book.module_name,
            "path": book.path,
            "summary": book.summary,
            "tags": list(book.tags),
            "status": book.status,
            "created_at": book.created_at.isoformat(),
            "updated_at": book.updated_at.isoformat(),
        }


# Alias for backwards compatibility with book_mapper
BookMapper = CatalogMapper
