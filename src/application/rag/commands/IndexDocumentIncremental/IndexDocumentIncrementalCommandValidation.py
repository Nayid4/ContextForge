from __future__ import annotations
from application.rag.commands.IndexDocumentIncremental.IndexDocumentIncrementalCommand import IndexDocumentIncrementalCommand
from domain.common import DomainError

class IndexDocumentIncrementalCommandValidation:
    def validate(self, request: IndexDocumentIncrementalCommand) -> list[DomainError]:
        if not request.document.id:
            return [DomainError.validation("empty_doc_id", "Documento sin ID válido.")]
        return []
