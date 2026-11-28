from __future__ import annotations
from application.documents.queries.CompareDocumentVersions.CompareDocumentVersionsQuery import CompareDocumentVersionsQuery
from domain.common import DomainError

class CompareDocumentVersionsQueryValidation:
    def validate(self, request: CompareDocumentVersionsQuery) -> list[DomainError]:
        if request.from_version < 1 or request.to_version < 1:
            return [DomainError.validation("invalid_version_numbers", "Las versiones a comparar deben ser >= 1.")]
        return []
