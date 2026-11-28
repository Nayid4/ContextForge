"""Repository port for API Key persistence with DB-level pagination."""

from __future__ import annotations

from typing import Protocol

from domain.common import PagedResult, PageParams
from domain.users.api_key_entity import ApiKeyEntity


class IApiKeyRepositoryPort(Protocol):
    async def save_key(self, api_key: ApiKeyEntity) -> ApiKeyEntity: ...
    async def get_by_hash(self, key_sha256: str) -> ApiKeyEntity | None: ...
    async def list_keys(self, user_id: str | None = None) -> list[ApiKeyEntity]: ...
    async def list_paginated(
        self,
        *,
        user_id: str | None = None,
        pagination: PageParams = PageParams(),
    ) -> PagedResult[ApiKeyEntity]: ...
    async def revoke_key(self, key_id: str) -> bool: ...
    async def touch_last_used(self, key_id: str) -> None: ...
