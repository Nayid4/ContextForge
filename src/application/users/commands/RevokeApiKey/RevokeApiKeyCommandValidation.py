from __future__ import annotations
from application.users.commands.RevokeApiKey.RevokeApiKeyCommand import RevokeApiKeyCommand
from domain.common import DomainError

class RevokeApiKeyCommandValidation:
    def validate(self, request: RevokeApiKeyCommand) -> list[DomainError]:
        if not request.key_id.strip():
            return [DomainError.validation("empty_key_id", "key_id obligatorio.")]
        return []
