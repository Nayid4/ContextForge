"""GetDocumentDetail Query Validator."""

from __future__ import annotations

from application.documents.queries.GetDocumentDetail.GetDocumentDetailQuery import GetDocumentDetailQuery
from domain.common import DomainError


class GetDocumentDetailQueryValidation:
    def validate(self, request: GetDocumentDetailQuery) -> list[DomainError]:
        if not request.path.strip():
            return [DomainError.validation("empty_path", "La ruta del documento es obligatoria.")]
        return []
