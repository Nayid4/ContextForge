from __future__ import annotations
from application.users.commands.RevokeApiKey.RevokeApiKeyCommand import RevokeApiKeyCommand
from domain.common import DomainError, ErrorOr
from domain.users import IApiKeyRepositoryPort

class RevokeApiKeyCommandHandler:
    def __init__(self, key_repo: IApiKeyRepositoryPort) -> None:
        self._repo = key_repo

    async def handle(self, request: RevokeApiKeyCommand) -> ErrorOr[bool]:
        ok = await self._repo.revoke_key(request.key_id)
        if not ok:
            return ErrorOr.fail(DomainError.not_found("api_key_not_found", f"API Key '{request.key_id}' no encontrada."))
        return ErrorOr.ok(True)
