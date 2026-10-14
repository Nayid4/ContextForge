"""Validator for AskScopedDocumentQuery."""

from __future__ import annotations

from application.chat.queries.ask_scoped_document.query import (
    AskScopedDocumentQuery,
)
from application.commons.exceptions.application_exceptions import ValidationException


class AskScopedDocumentValidator:
    """Validates parameters for AskScopedDocumentQuery."""

    def validate(self, query: AskScopedDocumentQuery) -> None:
        if not query.book_id or not query.book_id.strip():
            raise ValidationException("Book ID cannot be empty.")
        if not query.query or not query.query.strip():
            raise ValidationException("Question query cannot be empty.")
