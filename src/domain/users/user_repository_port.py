"""Repository port for User persistence."""

from __future__ import annotations

from typing import Protocol

from domain.users.user_entity import UserEntity


class IUserRepositoryPort(Protocol):
    async def get_by_email(self, email: str) -> UserEntity | None: ...
    async def get_by_id(self, user_id: str) -> UserEntity | None: ...
    async def list_users(self) -> list[UserEntity]: ...
    async def save_user(self, user: UserEntity) -> UserEntity: ...
