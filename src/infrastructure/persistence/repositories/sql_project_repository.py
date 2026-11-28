"""SQLAlchemy Async Repository for Projects & Taxonomy (PRJ) with real DB pagination."""

from __future__ import annotations

from sqlalchemy import delete, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from domain.common import PagedResult, PageParams
from domain.projects import IProjectRepositoryPort, ProjectEntity, ProjectMemberEntity, TaxonomyItemEntity, TaxonomyKind
from infrastructure.persistence.models import ProjectMemberORM, ProjectORM, TaxonomyItemORM


def _map_project(r: ProjectORM) -> ProjectEntity:
    return ProjectEntity(
        slug=r.slug,
        name=r.name,
        path=r.path,
        description=r.description,
        sovereign_only=r.sovereign_only,
        max_quota_mb=r.max_quota_mb,
        is_active=r.is_active,
        owner_id=r.owner_id,
        created_at=r.created_at,
        updated_at=r.updated_at,
    )


class SqlProjectRepository(IProjectRepositoryPort):
    def __init__(self, session_maker: async_sessionmaker[AsyncSession]) -> None:
        self._sm = session_maker

    async def list_projects(self) -> list[ProjectEntity]:
        async with self._sm() as s:
            rows = (await s.execute(select(ProjectORM).order_by(ProjectORM.slug.asc()))).scalars().all()
            return [_map_project(r) for r in rows]

    async def list_paginated(
        self,
        *,
        search: str | None = None,
        allowed_slugs: tuple[str, ...] = ("*",),
        pagination: PageParams = PageParams(),
    ) -> PagedResult[ProjectEntity]:
        norm = pagination.normalized()
        async with self._sm() as s:
            stmt = select(ProjectORM)
            cnt = select(func.count()).select_from(ProjectORM)
            if "*" not in allowed_slugs:
                cond_scope = ProjectORM.slug.in_(list(allowed_slugs))
                stmt = stmt.where(cond_scope)
                cnt = cnt.where(cond_scope)
            if search and search.strip():
                q = f"%{search.strip()}%"
                cond = or_(ProjectORM.name.ilike(q), ProjectORM.slug.ilike(q), ProjectORM.description.ilike(q))
                stmt = stmt.where(cond)
                cnt = cnt.where(cond)
            total = int((await s.execute(cnt)).scalar_one() or 0)
            rows = (
                await s.execute(
                    stmt.order_by(ProjectORM.is_active.desc(), ProjectORM.slug.asc()).offset(norm.offset).limit(norm.page_size)
                )
            ).scalars().all()
            return PagedResult(items=tuple(_map_project(r) for r in rows), page=norm.page, page_size=norm.page_size, total_count=total)

    async def get_by_slug(self, slug: str) -> ProjectEntity | None:
        async with self._sm() as s:
            r = (await s.execute(select(ProjectORM).where(ProjectORM.slug == slug))).scalar_one_or_none()
            return _map_project(r) if r else None

    async def get_active(self) -> ProjectEntity:
        async with self._sm() as s:
            r = (await s.execute(select(ProjectORM).where(ProjectORM.is_active.is_(True)))).scalars().first()
            if r is None:
                r = (await s.execute(select(ProjectORM).where(ProjectORM.slug == "default"))).scalar_one_or_none()
            if r is not None:
                return _map_project(r)
            return ProjectEntity(slug="default", name="ContextForge Core", path="./docs", is_active=True)

    async def save(self, project: ProjectEntity) -> ProjectEntity:
        async with self._sm() as s:
            existing = (await s.execute(select(ProjectORM).where(ProjectORM.slug == project.slug))).scalar_one_or_none()
            if existing is None:
                existing = ProjectORM(
                    slug=project.slug,
                    owner_id=project.owner_id,
                    name=project.name,
                    description=project.description,
                    path=project.path,
                    sovereign_only=project.sovereign_only,
                    max_quota_mb=project.max_quota_mb,
                    is_active=project.is_active,
                )
                s.add(existing)
            else:
                existing.name = project.name
                existing.description = project.description
                existing.path = project.path
                existing.sovereign_only = project.sovereign_only
                existing.max_quota_mb = project.max_quota_mb
            await s.commit()
            return _map_project(existing)

    async def set_active(self, slug: str) -> ProjectEntity | None:
        async with self._sm() as s:
            target = (await s.execute(select(ProjectORM).where(ProjectORM.slug == slug))).scalar_one_or_none()
            if target is None:
                return None
            await s.execute(update(ProjectORM).values(is_active=False))
            target.is_active = True
            await s.commit()
            return _map_project(target)

    async def delete(self, slug: str) -> bool:
        if slug == "default":
            return False
        async with self._sm() as s:
            res = await s.execute(delete(ProjectORM).where(ProjectORM.slug == slug))
            await s.commit()
            return bool(res.rowcount)

    async def list_members(self, project_slug: str) -> list[ProjectMemberEntity]:
        async with self._sm() as s:
            rows = (
                await s.execute(
                    select(ProjectMemberORM)
                    .where(ProjectMemberORM.project_slug == project_slug)
                    .order_by(ProjectMemberORM.created_at.asc())
                )
            ).scalars().all()
            return [
                ProjectMemberEntity(
                    member_id=r.member_id,
                    project_slug=r.project_slug,
                    user_id=r.user_id,
                    role=r.role,
                    created_at=r.created_at,
                )
                for r in rows
            ]

    async def upsert_member(self, member: ProjectMemberEntity) -> ProjectMemberEntity:
        async with self._sm() as s:
            existing = (
                await s.execute(
                    select(ProjectMemberORM).where(
                        ProjectMemberORM.project_slug == member.project_slug,
                        ProjectMemberORM.user_id == member.user_id,
                    )
                )
            ).scalar_one_or_none()
            if existing is None:
                s.add(
                    ProjectMemberORM(
                        member_id=member.member_id,
                        project_slug=member.project_slug,
                        user_id=member.user_id,
                        role=member.role,
                    )
                )
            else:
                existing.role = member.role
            await s.commit()
            return member

    async def remove_member(self, project_slug: str, user_id: str) -> bool:
        async with self._sm() as s:
            res = await s.execute(
                delete(ProjectMemberORM).where(
                    ProjectMemberORM.project_slug == project_slug,
                    ProjectMemberORM.user_id == user_id,
                )
            )
            await s.commit()
            return bool(res.rowcount)

    async def get_member_role(self, project_slug: str, user_id: str) -> str | None:
        async with self._sm() as s:
            r = (
                await s.execute(
                    select(ProjectMemberORM.role).where(
                        ProjectMemberORM.project_slug == project_slug,
                        ProjectMemberORM.user_id == user_id,
                    )
                )
            ).scalar_one_or_none()
            return str(r) if r else None

    async def list_taxonomy(
        self,
        project_slug: str,
        kind: TaxonomyKind | None = None,
        search: str | None = None,
    ) -> list[TaxonomyItemEntity]:
        async with self._sm() as s:
            stmt = select(TaxonomyItemORM).where(TaxonomyItemORM.project_slug == project_slug)
            if kind is not None:
                stmt = stmt.where(TaxonomyItemORM.kind == kind.value)
            if search and search.strip():
                q = f"%{search.strip()}%"
                stmt = stmt.where(or_(TaxonomyItemORM.name.ilike(q), TaxonomyItemORM.slug.ilike(q)))
            rows = (await s.execute(stmt.order_by(TaxonomyItemORM.name.asc()))).scalars().all()
            return [
                TaxonomyItemEntity(
                    id=r.id,
                    project_slug=r.project_slug,
                    slug=r.slug,
                    kind=TaxonomyKind(r.kind),
                    name=r.name,
                    description=r.description,
                    color=r.color,
                    icon=r.icon,
                    created_at=r.created_at,
                )
                for r in rows
            ]

    async def save_taxonomy(self, item: TaxonomyItemEntity) -> TaxonomyItemEntity:
        async with self._sm() as s:
            existing = (
                await s.execute(
                    select(TaxonomyItemORM).where(
                        TaxonomyItemORM.project_slug == item.project_slug,
                        TaxonomyItemORM.kind == item.kind.value,
                        TaxonomyItemORM.slug == item.slug,
                    )
                )
            ).scalar_one_or_none()
            if existing is None:
                s.add(
                    TaxonomyItemORM(
                        id=item.id,
                        project_slug=item.project_slug,
                        kind=item.kind.value,
                        slug=item.slug,
                        name=item.name,
                        description=item.description,
                        color=item.color,
                        icon=item.icon,
                    )
                )
            else:
                existing.name = item.name
                existing.description = item.description
                existing.color = item.color
            await s.commit()
            return item
