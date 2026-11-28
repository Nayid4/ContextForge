"""CreateDocument Command Validator."""

from __future__ import annotations

from application.documents.commands.CreateDocument.CreateDocumentCommand import CreateDocumentCommand
from domain.common import DomainError
from domain.documents import EditorialStatus


class CreateDocumentCommandValidation:
    def validate(self, request: CreateDocumentCommand) -> list[DomainError]:
        errs: list[DomainError] = []
        if not request.path.strip():
            errs.append(DomainError.validation("empty_path", "La ruta del documento es obligatoria."))
        if not request.title.strip():
            errs.append(DomainError.validation("non_empty_title", "El título del documento es obligatorio."))
        if not request.content_markdown.strip():
            errs.append(DomainError.validation("non_empty_content", "El contenido Markdown no puede estar vacío."))
        st = EditorialStatus.parse(request.status)
        if st.is_error:
            errs.extend(st.errors)
        return errs
