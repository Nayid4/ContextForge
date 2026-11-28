"""SQLAlchemy Async Repository for Global SystemSettings (SRP/ISP)."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from domain.users import ISettingsRepositoryPort, SystemSettingsEntity
from infrastructure.persistence.models import SettingsORM


class SqlSettingsRepository(ISettingsRepositoryPort):
    def __init__(self, session_maker: async_sessionmaker[AsyncSession]) -> None:
        self._sm = session_maker

    async def get_settings(self) -> SystemSettingsEntity:
        async with self._sm() as s:
            r = (await s.execute(select(SettingsORM).where(SettingsORM.id == "default"))).scalar_one_or_none()
            if r is None:
                return SystemSettingsEntity()
            return SystemSettingsEntity(
                id=r.id,
                active_llm_model=r.active_llm_model,
                ollama_url=r.ollama_url,
                docs_path=r.docs_path,
                embedding_model=r.embedding_model,
                temperature=r.temperature,
                min_grounding_score=r.min_grounding_score,
                enable_dlp_redaction=r.enable_dlp_redaction,
                enable_extractive_fallback=r.enable_extractive_fallback,
                updated_at=r.updated_at,
            )

    async def save_settings(self, settings: SystemSettingsEntity) -> SystemSettingsEntity:
        async with self._sm() as s:
            r = (await s.execute(select(SettingsORM).where(SettingsORM.id == "default"))).scalar_one_or_none()
            if r is None:
                r = SettingsORM(id="default")
                s.add(r)
            r.active_llm_model = settings.active_llm_model
            r.ollama_url = settings.ollama_url
            r.docs_path = settings.docs_path
            r.embedding_model = settings.embedding_model
            r.temperature = settings.temperature
            r.min_grounding_score = settings.min_grounding_score
            r.enable_dlp_redaction = settings.enable_dlp_redaction
            r.enable_extractive_fallback = settings.enable_extractive_fallback
            await s.commit()
            return settings
