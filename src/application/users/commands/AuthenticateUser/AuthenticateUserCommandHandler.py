from __future__ import annotations
from typing import Callable
from application.users.commands.AuthenticateUser.AuthenticateUserCommand import AuthenticateUserCommand
from domain.common import DomainError, ErrorOr
from domain.users import IUserRepositoryPort, UserEntity

class AuthenticateUserCommandHandler:
    def __init__(
        self,
        user_repo: IUserRepositoryPort,
        verify_password_fn: Callable[[str, str], bool],
        issue_tokens_fn: Callable[[UserEntity], dict[str, object]],
    ) -> None:
        self._users = user_repo
        self._verify = verify_password_fn
        self._issue = issue_tokens_fn

    async def handle(self, request: AuthenticateUserCommand) -> ErrorOr[dict[str, object]]:
        user = await self._users.get_by_email(request.email.strip().lower())
        if user is None or not user.is_active or not self._verify(request.password, user.password_hash):
            return ErrorOr.fail(DomainError.unauthorized("invalid_credentials", "Credenciales inválidas o cuenta inactiva (RNF-01)."))
        return ErrorOr.ok(self._issue(user))
