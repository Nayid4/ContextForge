"""Handler for GetBooksQuery."""

from __future__ import annotations

from application.catalog.queries.get_books.query import GetBooksQuery
from application.catalog.queries.get_books.response import GetBooksResponse
from application.catalog.queries.get_books.validator import GetBooksValidator
from application.mappers.catalog_mapper import CatalogMapper
from domain.catalog.repositories import IBookRepository


class GetBooksHandler:
    """Retrieves books list from repository."""

    def __init__(self, book_repo: IBookRepository) -> None:
        self._book_repo = book_repo
        self._validator = GetBooksValidator()

    async def handle(self, query: GetBooksQuery) -> GetBooksResponse:
        self._validator.validate(query)
        if query.library_slug:
            books = await self._book_repo.list_by_library(query.library_slug)
        else:
            books = await self._book_repo.list_all()

        dtos = [CatalogMapper.book_to_dto(b) for b in books]
        return GetBooksResponse(books=dtos, count=len(dtos))

