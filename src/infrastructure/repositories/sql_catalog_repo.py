"""SQL Catalog Repositories: ILibraryRepository and IBookRepository implementations."""

from __future__ import annotations

from typing import Sequence
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from domain.catalog.entities import Book, Library
from domain.catalog.repositories import IBookRepository, ILibraryRepository
from infrastructure.persistence.models.book_model import BookORM
from infrastructure.persistence.models.library_model import LibraryORM


class SqlLibraryRepository(ILibraryRepository):
    """SQLAlchemy implementation of ILibraryRepository."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _to_entity(self, orm: LibraryORM) -> Library:
        return Library(
            slug=orm.slug,
            name=orm.name,
            description=orm.description or "",
            path=orm.path,
            is_active=bool(orm.is_active),
            created_at=orm.created_at,
            updated_at=orm.updated_at,
        )

    async def get_by_slug(self, slug: str) -> Library | None:
        clean_slug = slug.strip().lower()
        query = select(LibraryORM).where(LibraryORM.slug == clean_slug)
        result = await self._session.execute(query)
        orm = result.scalar_one_or_none()
        if not orm:
            return None
        return self._to_entity(orm)

    async def list_all(self) -> list[Library]:
        query = select(LibraryORM).order_by(LibraryORM.name.asc())
        result = await self._session.execute(query)
        orms = result.scalars().all()
        return [self._to_entity(orm) for orm in orms]

    async def get_active(self) -> Library | None:
        query = select(LibraryORM).where(LibraryORM.is_active.is_(True))
        result = await self._session.execute(query)
        orm = result.scalars().first()
        if not orm:
            return None
        return self._to_entity(orm)

    async def save(self, library: Library) -> Library:
        query = select(LibraryORM).where(LibraryORM.slug == library.slug)
        result = await self._session.execute(query)
        orm = result.scalar_one_or_none()
        if orm:
            orm.name = library.name
            orm.description = library.description
            orm.path = library.path
            orm.is_active = library.is_active
            orm.updated_at = library.updated_at
        else:
            orm = LibraryORM(
                slug=library.slug,
                name=library.name,
                description=library.description,
                path=library.path,
                is_active=library.is_active,
                created_at=library.created_at,
                updated_at=library.updated_at,
            )
            self._session.add(orm)
        await self._session.commit()
        return self._to_entity(orm)

    async def set_active(self, slug: str) -> bool:
        clean_slug = slug.strip().lower()
        await self._session.execute(update(LibraryORM).values(is_active=False))
        result = await self._session.execute(
            update(LibraryORM).where(LibraryORM.slug == clean_slug).values(is_active=True)
        )
        rowcount = int(getattr(result, "rowcount", 0))
        return rowcount > 0

    async def delete(self, slug: str) -> bool:
        clean_slug = slug.strip().lower()
        query = select(LibraryORM).where(LibraryORM.slug == clean_slug)
        result = await self._session.execute(query)
        orm = result.scalar_one_or_none()
        if not orm:
            return False
        await self._session.delete(orm)
        await self._session.commit()
        return True


class SqlBookRepository(IBookRepository):
    """SQLAlchemy implementation of IBookRepository."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _to_entity(self, orm: BookORM) -> Book:
        return Book(
            id=orm.id,
            slug=orm.slug,
            title=orm.title,
            library_slug=orm.library_slug,
            module_name=orm.module_name,
            path=orm.path,
            summary=orm.summary or "",
            tags=[],
            status=orm.status,
            created_at=orm.created_at,
            updated_at=orm.updated_at,
        )

    async def get_by_id(self, book_id: str) -> Book | None:
        query = select(BookORM).where(BookORM.id == book_id)
        result = await self._session.execute(query)
        orm = result.scalar_one_or_none()
        if not orm:
            return None
        return self._to_entity(orm)

    async def get_by_path(self, library_slug: str, relative_path: str) -> Book | None:
        query = select(BookORM).where(
            BookORM.library_slug == library_slug.lower(),
            BookORM.path == relative_path,
        )
        result = await self._session.execute(query)
        orm = result.scalar_one_or_none()
        if not orm:
            return None
        return self._to_entity(orm)

    async def list_by_library(self, library_slug: str) -> list[Book]:
        query = select(BookORM).where(BookORM.library_slug == library_slug.lower()).order_by(BookORM.title.asc())
        result = await self._session.execute(query)
        orms: Sequence[BookORM] = result.scalars().all()
        return [self._to_entity(orm) for orm in orms]

    async def list_all(self) -> list[Book]:
        query = select(BookORM).order_by(BookORM.title.asc())
        result = await self._session.execute(query)
        orms: Sequence[BookORM] = result.scalars().all()
        return [self._to_entity(orm) for orm in orms]

    async def save(self, book: Book) -> Book:
        query = select(BookORM).where(BookORM.id == book.id)
        result = await self._session.execute(query)
        orm = result.scalar_one_or_none()
        if orm:
            orm.slug = book.slug
            orm.title = book.title
            orm.library_slug = book.library_slug
            orm.module_name = book.module_name
            orm.path = book.path
            orm.summary = book.summary
            orm.status = book.status
            orm.updated_at = book.updated_at
        else:
            orm = BookORM(
                id=book.id,
                slug=book.slug,
                title=book.title,
                library_slug=book.library_slug,
                module_name=book.module_name,
                path=book.path,
                summary=book.summary,
                status=book.status,
                created_at=book.created_at,
                updated_at=book.updated_at,
            )
            self._session.add(orm)
        await self._session.commit()
        return self._to_entity(orm)

    async def delete(self, book_id: str) -> bool:
        query = select(BookORM).where(BookORM.id == book_id)
        result = await self._session.execute(query)
        orm = result.scalar_one_or_none()
        if not orm:
            return False
        await self._session.delete(orm)
        await self._session.commit()
        return True
