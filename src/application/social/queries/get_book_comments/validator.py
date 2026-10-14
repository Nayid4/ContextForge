"""Validator for GetBookCommentsQuery."""

from __future__ import annotations

from application.commons.exceptions.application_exceptions import ValidationException
from application.social.queries.get_book_comments.query import (
    GetBookCommentsQuery,
)


class GetBookCommentsValidator:
    """Validates parameters for GetBookCommentsQuery."""

    def validate(self, query: GetBookCommentsQuery) -> None:
        if not query.target_id or not query.target_id.strip():
            raise ValidationException("Target book or document ID cannot be empty.")
