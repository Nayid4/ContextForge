"""AskScopedDocument Query Validator."""

from __future__ import annotations

from application.rag.queries.AskScopedDocument.AskScopedDocumentQuery import AskScopedDocumentQuery
from domain.common import DomainError


class AskScopedDocumentQueryValidation:
    def validate(self, request: AskScopedDocumentQuery) -> list[DomainError]:
        if not request.question.strip():
            return [DomainError.validation("empty_question", "La pregunta no puede estar vacía.")]
        return []
