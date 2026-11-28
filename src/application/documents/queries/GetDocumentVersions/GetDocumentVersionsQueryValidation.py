"""GetDocumentVersions Query Validator."""

from __future__ import annotations

from application.documents.queries.GetDocumentVersions.GetDocumentVersionsQuery import GetDocumentVersionsQuery
from domain.common import DomainError


class GetDocumentVersionsQueryValidation:
    def validate(self, request: GetDocumentVersionsQuery) -> list[DomainError]:
        if not request.path.strip():
            return [DomainError.validation("empty_path", "La ruta del documento es obligatoria.")]
        return []
