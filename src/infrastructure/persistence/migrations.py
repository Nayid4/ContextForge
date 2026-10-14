"""SQLite DDL and Migration Scripts for ContextForge."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncEngine, async_sessionmaker, AsyncSession
from infrastructure.persistence.orm_models import Base, ProjectORM, SettingsModel

PROJECTS_TABLE_DDL = """
CREATE TABLE IF NOT EXISTS projects (
    slug VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    path VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
"""


async def apply_migrations(engine: AsyncEngine) -> None:
    """Execute schema creation and DDL migrations for ContextForge."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def seed_initial_project(session: AsyncSession) -> ProjectORM:
    """Seed default project if none exists."""
    result = await session.execute(select(ProjectORM).where(ProjectORM.slug == "default"))
    existing_project = result.scalars().first()

    if existing_project is None:
        default_project = ProjectORM(
            slug="default",
            name="ContextForge Core",
            description="Proyecto principal de arquitectura y documentación técnica",
            path="./docs",
            is_active=True,
        )
        session.add(default_project)
        await session.commit()
        return default_project

    return existing_project

