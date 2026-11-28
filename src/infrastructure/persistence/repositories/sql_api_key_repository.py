"""SQLAlchemy Async Repository for API Keys with real DB pagination (SRP/ISP)."""

from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from domain.common import PagedResult, PageParams
from domain.users import ApiKeyEntity, IApiKeyRepositoryPort, UserRole
from infrastructure.persistence.models import ApiKeyORM


def _map_apikey(r: ApiKeyORM) -> ApiKeyEntity:
    role_res = UserRole.parse(r.role_scope)
    projs = tuple(p.strip() for p in r.allowed_projects_csv.split(",") if p.strip()) or ("default",)
    origins = tuple(o.strip() for o in (r.allowed_origins_csv or "").split(",") if o.strip())
    agents = tuple(a.strip() for a in (getattr(r, "allowed_agents_csv", "") or "").split(",") if a.strip())
    exp = r.expires_at
    if exp and exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    rev = r.revoked_at
    if rev and rev.tzinfo is None:
        rev = rev.replace(tzinfo=timezone.utc)
    last_used = getattr(r, "last_used_at", None)
    if last_used and last_used.tzinfo is None:
        last_used = last_used.replace(tzinfo=timezone.utc)
    return ApiKeyEntity(
        key_id=r.key_id,
        user_id=r.user_id,
        name=r.name,
        key_prefix=r.key_prefix,
        key_sha256=r.key_sha256,
        role_scope=role_res.value if not role_res.is_error else UserRole.AGENT_CLIENT,
        allowed_projects=projs,
        is_publishable=bool(r.is_publishable),
        allowed_origins=origins,
        allowed_agents=agents,
        daily_quota_requests=int(getattr(r, "daily_quota_requests", 1000) or 1000),
        last_used_at=last_used,
        expires_at=exp,
        revoked_at=rev,
        created_at=r.created_at,
    )


class SqlApiKeyRepository(IApiKeyRepositoryPort):
    def __init__(self, session_maker: async_sessionmaker[AsyncSession]) -> None:
        self._sm = session_maker

    async def save_key(self, api_key: ApiKeyEntity) -> ApiKeyEntity:
        async with self._sm() as s:
            s.add(
                ApiKeyORM(
                    key_id=api_key.key_id,
                    user_id=api_key.user_id,
                    name=api_key.name,
                    key_prefix=api_key.key_prefix,
                    key_sha256=api_key.key_sha256,
                    role_scope=api_key.role_scope.value,
                    allowed_projects_csv=",".join(api_key.allowed_projects),
                    is_publishable=api_key.is_publishable,
                    allowed_origins_csv=",".join(api_key.allowed_origins),
                    allowed_agents_csv=",".join(api_key.allowed_agents),
                    daily_quota_requests=api_key.daily_quota_requests,
                    expires_at=api_key.expires_at,
                )
            )
            await s.commit()
            return api_key

    async def get_by_hash(self, key_sha256: str) -> ApiKeyEntity | None:
        async with self._sm() as s:
            r = (await s.execute(select(ApiKeyORM).where(ApiKeyORM.key_sha256 == key_sha256))).scalar_one_or_none()
            return _map_apikey(r) if r else None

    async def list_keys(self, user_id: str | None = None) -> list[ApiKeyEntity]:
        async with self._sm() as s:
            stmt = select(ApiKeyORM)
            if user_id:
                stmt = stmt.where(ApiKeyORM.user_id == user_id)
            rows = (await s.execute(stmt.order_by(ApiKeyORM.created_at.desc()))).scalars().all()
            return [_map_apikey(r) for r in rows]

    async def list_paginated(
        self,
        *,
        user_id: str | None = None,
        pagination: PageParams = PageParams(),
    ) -> PagedResult[ApiKeyEntity]:
        norm = pagination.normalized()
        async with self._sm() as s:
            stmt = select(ApiKeyORM)
            cnt = select(func.count()).select_from(ApiKeyORM)
            if user_id:
                stmt = stmt.where(ApiKeyORM.user_id == user_id)
                cnt = cnt.where(ApiKeyORM.user_id == user_id)
            total = int((await s.execute(cnt)).scalar_one() or 0)
            rows = (
                await s.execute(stmt.order_by(ApiKeyORM.created_at.desc()).offset(norm.offset).limit(norm.page_size))
            ).scalars().all()
            return PagedResult(items=tuple(_map_apikey(r) for r in rows), page=norm.page, page_size=norm.page_size, total_count=total)

    async def revoke_key(self, key_id: str) -> bool:
        async with self._sm() as s:
            r = (await s.execute(select(ApiKeyORM).where(ApiKeyORM.key_id == key_id))).scalar_one_or_none()
            if r is None:
                return False
            r.revoked_at = datetime.now(timezone.utc)
            await s.commit()
            return True

    async def touch_last_used(self, key_id: str) -> None:
        async with self._sm() as s:
            r = (await s.execute(select(ApiKeyORM).where(ApiKeyORM.key_id == key_id))).scalar_one_or_none()
            if r is not None:
                r.last_used_at = datetime.now(timezone.utc)
                await s.commit()
