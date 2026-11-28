from __future__ import annotations
from application.users.commands.AuthenticateUser.AuthenticateUserCommand import AuthenticateUserCommand
from domain.common import DomainError

class AuthenticateUserCommandValidation:
    def validate(self, request: AuthenticateUserCommand) -> list[DomainError]:
        if "@" not in request.email or not request.password:
            return [DomainError.validation("invalid_credentials_format", "Debe ingresar email y contraseña válidos.")]
        return []
