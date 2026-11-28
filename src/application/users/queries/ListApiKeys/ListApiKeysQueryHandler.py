from __future__ import annotations
from application.users.queries.ListApiKeys.ListApiKeysQuery import ListApiKeysQuery
from domain.common import ErrorOr
from domain.users import IApiKeyRepositoryPort

class ListApiKeysQueryHandler:
    def __init__(self, key_repo: IApiKeyRepositoryPort) -> None:
        self._repo = key_repo

    async def handle(self, request: ListApiKeysQuery) -> ErrorOr[list[dict[str, object]]]:
        keys = await self._repo.list_keys(user_id=request.user_id)
        return ErrorOr.ok(
            [
                {
                    "key_id": k.key_id,
                    "name": k.name,
                    "key_prefix": k.key_prefix,
                    "role_scope": k.role_scope.value,
                    "allowed_projects": list(k.allowed_projects),
                    "is_valid": k.is_valid,
                    "created_at": k.created_at.isoformat(),
                    "revoked_at": k.revoked_at.isoformat() if k.revoked_at else None,
                }
                for k in keys
            ]
        )
