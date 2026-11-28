"""UpdateDocument Command Validator."""

from __future__ import annotations

from application.documents.commands.UpdateDocument.UpdateDocumentCommand import UpdateDocumentCommand
from domain.common import DomainError


class UpdateDocumentCommandValidation:
    def validate(self, request: UpdateDocumentCommand) -> list[DomainError]:
        errs: list[DomainError] = []
        if not request.path.strip():
            errs.append(DomainError.validation("empty_path", "La ruta del documento es obligatoria."))
        if not request.title.strip():
            errs.append(DomainError.validation("non_empty_title", "El título del documento es obligatorio."))
        if not request.content_markdown.strip():
            errs.append(DomainError.validation("non_empty_content", "El contenido Markdown no puede estar vacío."))
        return errs
