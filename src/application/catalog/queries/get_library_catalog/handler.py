"""Handler for GetLibraryCatalogQuery."""

from __future__ import annotations

from application.catalog.queries.get_library_catalog.query import (
    GetLibraryCatalogQuery,
)
from application.catalog.queries.get_library_catalog.response import (
    GetLibraryCatalogResponse,
)
from application.catalog.queries.get_library_catalog.validator import (
    GetLibraryCatalogValidator,
)
from application.mappers.catalog_mapper import CatalogMapper
from domain.catalog.repositories import ILibraryRepository


class GetLibraryCatalogHandler:
    """Retrieves all registered libraries and active library."""

    def __init__(self, library_repo: ILibraryRepository) -> None:
        self._library_repo = library_repo
        self._validator = GetLibraryCatalogValidator()

    async def handle(self, query: GetLibraryCatalogQuery) -> GetLibraryCatalogResponse:
        self._validator.validate(query)
        libs = await self._library_repo.list_all()
        active = await self._library_repo.get_active()

        return GetLibraryCatalogResponse(
            libraries=[CatalogMapper.library_to_dto(lib) for lib in libs],
            active_library=CatalogMapper.library_to_dto(active) if active else None,
        )
