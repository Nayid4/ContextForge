"""SQLAlchemy Async Repository for Users (SRP/ISP)."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from domain.users import IUserRepositoryPort, UserEntity, UserRole
from infrastructure.persistence.models import UserORM


def _map_user(r: UserORM) -> UserEntity:
    role_res = UserRole.parse(r.global_role)
    return UserEntity(
        user_id=r.user_id,
        email=r.email,
        full_name=r.full_name,
        password_hash=r.password_hash,
        role=role_res.value if not role_res.is_error else UserRole.CONSUMER,
        is_active=r.is_active,
        must_change_password=bool(getattr(r, "must_change_password", False)),
        created_at=r.created_at,
    )


class SqlUserRepository(IUserRepositoryPort):
    def __init__(self, session_maker: async_sessionmaker[AsyncSession]) -> None:
        self._sm = session_maker

    async def get_by_email(self, email: str) -> UserEntity | None:
        async with self._sm() as s:
            r = (await s.execute(select(UserORM).where(UserORM.email == email.strip().lower()))).scalar_one_or_none()
            return _map_user(r) if r else None

    async def get_by_id(self, user_id: str) -> UserEntity | None:
        async with self._sm() as s:
            r = (await s.execute(select(UserORM).where(UserORM.user_id == user_id))).scalar_one_or_none()
            return _map_user(r) if r else None

    async def list_users(self) -> list[UserEntity]:
        async with self._sm() as s:
            rows = (await s.execute(select(UserORM).order_by(UserORM.email.asc()))).scalars().all()
            return [_map_user(r) for r in rows]

    async def save_user(self, user: UserEntity) -> UserEntity:
        async with self._sm() as s:
            existing = (await s.execute(select(UserORM).where(UserORM.user_id == user.user_id))).scalar_one_or_none()
            if existing is None:
                s.add(
                    UserORM(
                        user_id=user.user_id,
                        email=user.email,
                        full_name=user.full_name,
                        password_hash=user.password_hash,
                        global_role=user.role.value,
                        is_active=user.is_active,
                        must_change_password=user.must_change_password,
                    )
                )
            else:
                existing.full_name = user.full_name
                existing.password_hash = user.password_hash
                existing.global_role = user.role.value
                existing.is_active = user.is_active
                existing.must_change_password = user.must_change_password
            await s.commit()
            return user
