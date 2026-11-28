from __future__ import annotations
from application.documents.commands.DeleteDocument.DeleteDocumentCommand import DeleteDocumentCommand
from domain.common import DomainError

class DeleteDocumentCommandValidation:
    def validate(self, request: DeleteDocumentCommand) -> list[DomainError]:
        if not request.path.strip():
            return [DomainError.validation("empty_path", "La ruta del documento es obligatoria.")]
        return []
