"""Database Connection and Initialization for ContextForge."""

from __future__ import annotations

import os
from pathlib import Path
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from infrastructure.database.orm_models import Base, SettingsModel

DEFAULT_DB_PATH = Path("./data/contextforge.db")


def get_database_url() -> str:
    return os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{DEFAULT_DB_PATH}")


def create_engine_instance(db_url: str | None = None) -> AsyncEngine:
    url = db_url or get_database_url()
    if "sqlite+aiosqlite" in url and "///" in url:
        path_str = url.split("///")[-1]
        if path_str and not path_str.startswith(":memory:"):
            Path(path_str).parent.mkdir(parents=True, exist_ok=True)

    return create_async_engine(url, echo=False)


def create_session_factory(engine: AsyncEngine) -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def _migrate_llm_configurations_schema(engine: AsyncEngine) -> None:
    """Ensure new columns exist in llm_configurations table on existing SQLite databases."""
    async with engine.begin() as conn:
        res = await conn.execute(text("PRAGMA table_info(llm_configurations)"))
        existing_cols = {row[1] for row in res.fetchall()}
        if existing_cols:
            if "engine_type" not in existing_cols:
                await conn.execute(
                    text("ALTER TABLE llm_configurations ADD COLUMN engine_type VARCHAR(50) NOT NULL DEFAULT 'local_http'")
                )
            if "cli_command" not in existing_cols:
                await conn.execute(
                    text("ALTER TABLE llm_configurations ADD COLUMN cli_command VARCHAR(100) NOT NULL DEFAULT ''")
                )
            if "cli_args" not in existing_cols:
                await conn.execute(
                    text("ALTER TABLE llm_configurations ADD COLUMN cli_args VARCHAR(255) NOT NULL DEFAULT ''")
                )


async def init_db(engine: AsyncEngine, seed: bool = True) -> None:
    """Create all tables and seed default settings if empty."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    await _migrate_llm_configurations_schema(engine)

    if not seed:
        return

    session_maker = create_session_factory(engine)
    async with session_maker() as session:
        result = await session.execute(select(SettingsModel).where(SettingsModel.id == "default"))
        existing_settings = result.scalars().first()
        if existing_settings is None:
            default_settings = SettingsModel(
                id="default",
                active_llm_model="llama3.1:8b",
                ollama_url="http://localhost:11434",
                docs_path="./docs",
                embedding_model="nomic-embed-text",
                temperature=0.2,
            )
            session.add(default_settings)
            await session.commit()

        # Seed default project if empty
        from infrastructure.persistence.migrations import seed_initial_project
        await seed_initial_project(session)

        # Seed default LLM configurations
        from infrastructure.repositories.sql_llm_config_repo import SqlLLMConfigRepository
        llm_repo = SqlLLMConfigRepository(session)
        await llm_repo.get_all()
