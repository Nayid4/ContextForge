"""Validator for GetLibraryCatalogQuery."""

from __future__ import annotations

from application.catalog.queries.get_library_catalog.query import (
    GetLibraryCatalogQuery,
)


class GetLibraryCatalogValidator:
    """Validates parameters for GetLibraryCatalogQuery."""

    def validate(self, query: GetLibraryCatalogQuery) -> None:
        pass
