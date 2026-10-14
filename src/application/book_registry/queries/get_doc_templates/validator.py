"""Validator for GetDocTemplatesQuery."""

from __future__ import annotations

from application.book_registry.queries.get_doc_templates.query import (
    GetDocTemplatesQuery,
)


class GetDocTemplatesValidator:
    """Validates parameters for GetDocTemplatesQuery."""

    def validate(self, query: GetDocTemplatesQuery) -> None:
        pass

