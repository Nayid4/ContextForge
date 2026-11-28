"""TransitionDocumentState Command Validator."""

from __future__ import annotations

from application.documents.commands.TransitionDocumentState.TransitionDocumentStateCommand import TransitionDocumentStateCommand
from domain.common import DomainError
from domain.documents import EditorialStatus


class TransitionDocumentStateCommandValidation:
    def validate(self, request: TransitionDocumentStateCommand) -> list[DomainError]:
        errs: list[DomainError] = []
        if not request.path.strip():
            errs.append(DomainError.validation("empty_path", "La ruta del documento es obligatoria."))
        st = EditorialStatus.parse(request.target_status)
        if st.is_error:
            errs.extend(st.errors)
        return errs
