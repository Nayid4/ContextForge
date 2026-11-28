from __future__ import annotations
from application.users.commands.IssueApiKey.IssueApiKeyCommand import IssueApiKeyCommand
from domain.common import DomainError
from domain.users import UserRole

class IssueApiKeyCommandValidation:
    def validate(self, request: IssueApiKeyCommand) -> list[DomainError]:
        errs: list[DomainError] = []
        if len(request.name.strip()) < 2:
            errs.append(DomainError.validation("invalid_key_name", "Nombre de API Key obligatorio."))
        r = UserRole.parse(request.role_scope)
        if r.is_error:
            errs.extend(r.errors)
        return errs
