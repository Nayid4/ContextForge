"""SQLite Project Repository implementation with automatic disk synchronization."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from core.domain.project import IProjectRepository, Project, ProjectSlug
from infrastructure.database.orm_models import ProjectORM


class SqliteProjectRepository(IProjectRepository):
    """SQLAlchemy implementation of IProjectRepository for SQLite with project.json sync."""

    def __init__(self, session: AsyncSession, docs_base_path: str = "./docs") -> None:
        self._session = session
        self._docs_base_path = Path(docs_base_path)

    def _to_entity(self, orm: ProjectORM) -> Project:
        return Project(
            slug=ProjectSlug(orm.slug),
            name=orm.name,
            description=orm.description or "",
            path=orm.path,
            is_active=bool(orm.is_active),
            created_at=orm.created_at,
            updated_at=orm.updated_at,
        )

    async def get_by_slug(self, slug: str) -> Project | None:
        clean_slug = slug.strip().lower()
        query = select(ProjectORM).where(ProjectORM.slug == clean_slug)
        result = await self._session.execute(query)
        orm = result.scalar_one_or_none()
        if not orm:
            return None
        return self._to_entity(orm)

    async def list_all(self) -> list[Project]:
        query = select(ProjectORM).order_by(ProjectORM.name.asc())
        result = await self._session.execute(query)
        orms = list(result.scalars().all())

        if not orms:
            # Auto-seed from existing ./docs directory or default
            discovered = self._discover_from_filesystem()
            for proj in discovered:
                await self.save(proj)
            return discovered

        return [self._to_entity(orm) for orm in orms]

    def _discover_from_filesystem(self) -> list[Project]:
        discovered: list[Project] = []
        if not self._docs_base_path.exists():
            default_p = Project.create(name="Default Project", slug="default", is_active=True)
            return [default_p]

        for item in self._docs_base_path.iterdir():
            if item.is_dir() and not item.name.startswith("."):
                slug_val = item.name.lower()
                meta_file = item / "project.json"
                name = slug_val.replace("-", " ").title()
                desc = f"Proyecto {name} (detectado en disco)"
                if meta_file.exists():
                    try:
                        with open(meta_file, mode="r", encoding="utf-8") as f:
                            data: dict[str, Any] = json.load(f)
                            name = data.get("name", name)
                            desc = data.get("description", desc)
                    except Exception:
                        pass
                try:
                    p = Project.create(
                        name=name,
                        slug=slug_val,
                        description=desc,
                        path=f"./docs/{slug_val}",
                        is_active=(len(discovered) == 0),
                    )
                    discovered.append(p)
                except Exception:
                    continue

        if not discovered:
            default_p = Project.create(name="Default Project", slug="default", is_active=True)
            discovered.append(default_p)
        return discovered

    async def save(self, project: Project) -> None:
        query = select(ProjectORM).where(ProjectORM.slug == project.slug.value)
        result = await self._session.execute(query)
        orm = result.scalar_one_or_none()

        if not orm:
            orm = ProjectORM(
                slug=project.slug.value,
                name=project.name,
                description=project.description,
                path=project.path,
                is_active=project.is_active,
                created_at=project.created_at,
                updated_at=project.updated_at,
            )
            self._session.add(orm)
        else:
            orm.name = project.name
            orm.description = project.description
            orm.path = project.path
            orm.is_active = project.is_active
            orm.updated_at = project.updated_at

        await self._session.commit()

        # Sync project.json to disk
        try:
            target_dir = Path(project.path)
            target_dir.mkdir(parents=True, exist_ok=True)
            meta_path = target_dir / "project.json"
            with open(meta_path, mode="w", encoding="utf-8") as f:
                json.dump(project.to_dict(), f, indent=2, ensure_ascii=False)
        except Exception:
            pass

    async def delete(self, slug: str) -> bool:
        clean_slug = slug.strip().lower()
        query = select(ProjectORM).where(ProjectORM.slug == clean_slug)
        result = await self._session.execute(query)
        orm = result.scalar_one_or_none()
        if not orm:
            return False
        await self._session.delete(orm)
        await self._session.commit()
        return True

    async def get_active(self) -> Project | None:
        query = select(ProjectORM).where(ProjectORM.is_active.is_(True))
        result = await self._session.execute(query)
        orm = result.scalar_one_or_none()
        if orm:
            return self._to_entity(orm)

        # Fallback to first available
        all_projects = await self.list_all()
        return all_projects[0] if all_projects else None

    async def set_active(self, slug: str) -> None:
        clean_slug = slug.strip().lower()
        # Deactivate all
        await self._session.execute(update(ProjectORM).values(is_active=False))
        # Activate target
        await self._session.execute(
            update(ProjectORM).where(ProjectORM.slug == clean_slug).values(is_active=True)
        )
        await self._session.commit()

