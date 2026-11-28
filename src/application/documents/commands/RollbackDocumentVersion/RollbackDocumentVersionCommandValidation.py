from __future__ import annotations
from application.documents.commands.RollbackDocumentVersion.RollbackDocumentVersionCommand import RollbackDocumentVersionCommand
from domain.common import DomainError

class RollbackDocumentVersionCommandValidation:
    def validate(self, request: RollbackDocumentVersionCommand) -> list[DomainError]:
        errs: list[DomainError] = []
        if request.target_version < 1:
            errs.append(DomainError.validation("invalid_target_version", "El número de versión objetivo debe ser >= 1."))
        if len(request.reason.strip()) < 3:
            errs.append(DomainError.validation("rollback_reason_required", "Debe especificar la razón del rollback."))
        return errs
