"""SQLAlchemy Async Repository for Context Bundles with real DB pagination."""

from __future__ import annotations

import json
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from domain.bundles import BundleManifestItemVO, ContextBundleEntity, IBundleRepositoryPort
from domain.common import PagedResult, PageParams
from infrastructure.persistence.models import ContextBundleORM


def _map_bundle(r: ContextBundleORM) -> ContextBundleEntity:
    raw_items = json.loads(r.manifest_json or "[]")
    items = tuple(
        BundleManifestItemVO(
            doc_id=i["doc_id"],
            path=i["path"],
            version_number=int(i["version_number"]),
            content_hash=i["content_hash"],
            included=bool(i["included"]),
            token_count=int(i["token_count"]),
        )
        for i in raw_items
    )
    return ContextBundleEntity(
        bundle_id=r.bundle_id,
        project_slug=r.project_slug,
        name=r.name,
        export_format=r.export_format,
        content=r.content,
        max_tokens=r.max_tokens,
        estimated_tokens=r.estimated_tokens,
        bundle_hash=r.bundle_hash,
        items=items,
        created_by=r.created_by,
        created_at=r.created_at,
    )


class SqlBundleRepository(IBundleRepositoryPort):
    def __init__(self, session_maker: async_sessionmaker[AsyncSession]) -> None:
        self._sm = session_maker

    async def save(self, bundle: ContextBundleEntity) -> ContextBundleEntity:
        manifest_data = [
            {
                "doc_id": i.doc_id,
                "path": i.path,
                "version_number": i.version_number,
                "content_hash": i.content_hash,
                "included": i.included,
                "token_count": i.token_count,
            }
            for i in bundle.items
        ]
        async with self._sm() as s:
            s.add(
                ContextBundleORM(
                    bundle_id=bundle.bundle_id,
                    project_slug=bundle.project_slug,
                    name=bundle.name,
                    export_format=bundle.export_format,
                    content=bundle.content,
                    max_tokens=bundle.max_tokens,
                    estimated_tokens=bundle.estimated_tokens,
                    bundle_hash=bundle.bundle_hash,
                    manifest_json=json.dumps(manifest_data, ensure_ascii=False),
                    created_by=bundle.created_by,
                )
            )
            await s.commit()
            return bundle

    async def get_by_id(self, bundle_id: str, project_slug: str | None = None) -> ContextBundleEntity | None:
        async with self._sm() as s:
            stmt = select(ContextBundleORM).where(ContextBundleORM.bundle_id == bundle_id)
            if project_slug:
                stmt = stmt.where(ContextBundleORM.project_slug == project_slug)
            r = (await s.execute(stmt)).scalar_one_or_none()
            return _map_bundle(r) if r else None

    async def list_by_project(self, project_slug: str) -> list[ContextBundleEntity]:
        async with self._sm() as s:
            rows = (
                await s.execute(
                    select(ContextBundleORM)
                    .where(ContextBundleORM.project_slug == project_slug)
                    .order_by(ContextBundleORM.created_at.desc())
                    .limit(50)
                )
            ).scalars().all()
            return [_map_bundle(r) for r in rows]

    async def list_paginated(
        self,
        *,
        project_slug: str,
        pagination: PageParams = PageParams(),
    ) -> PagedResult[ContextBundleEntity]:
        norm = pagination.normalized()
        async with self._sm() as s:
            stmt = select(ContextBundleORM).where(ContextBundleORM.project_slug == project_slug)
            cnt = select(func.count()).select_from(ContextBundleORM).where(ContextBundleORM.project_slug == project_slug)
            total = int((await s.execute(cnt)).scalar_one() or 0)
            rows = (
                await s.execute(stmt.order_by(ContextBundleORM.created_at.desc()).offset(norm.offset).limit(norm.page_size))
            ).scalars().all()
            return PagedResult(items=tuple(_map_bundle(r) for r in rows), page=norm.page, page_size=norm.page_size, total_count=total)
