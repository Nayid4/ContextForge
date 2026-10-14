"""Validator for GetBooksQuery."""

from __future__ import annotations

from application.catalog.queries.get_books.query import GetBooksQuery


class GetBooksValidator:
    """Validates parameters for GetBooksQuery."""

    def validate(self, query: GetBooksQuery) -> None:
        # Optional filter, no mandatory parameters required
        pass

