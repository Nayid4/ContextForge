"""ListDocumentsPaginated Query Validator."""

from __future__ import annotations

from application.documents.queries.ListDocumentsPaginated.ListDocumentsPaginatedQuery import ListDocumentsPaginatedQuery
from domain.common import DomainError


class ListDocumentsPaginatedQueryValidation:
    def validate(self, request: ListDocumentsPaginatedQuery) -> list[DomainError]:
        if request.page < 1 or request.page_size < 1:
            return [DomainError.validation("invalid_pagination", "Parámetros de paginación inválidos.")]
        return []
