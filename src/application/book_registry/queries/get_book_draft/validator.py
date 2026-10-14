"""Validator for GetBookDraftQuery."""

from __future__ import annotations

from application.book_registry.queries.get_book_draft.query import (
    GetBookDraftQuery,
)
from application.commons.exceptions.application_exceptions import ValidationException


class GetBookDraftValidator:
    """Validates parameters for GetBookDraftQuery."""

    def validate(self, query: GetBookDraftQuery) -> None:
        if not query.draft_id or not query.draft_id.strip():
            raise ValidationException("Draft ID cannot be empty.")

