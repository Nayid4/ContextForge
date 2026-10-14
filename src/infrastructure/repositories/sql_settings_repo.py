"""SQL Repository for System Settings."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession
from domain.settings.entities import SystemSettings
from domain.settings.repositories import ISettingsRepository
from infrastructure.database.orm_models import SettingsModel


class SqlSettingsRepository(ISettingsRepository):
    """SQLAlchemy implementation of ISettingsRepository."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_settings(self) -> SystemSettings:
        model = await self._session.get(SettingsModel, "default")
        if not model:
            # Fallback to default entity
            return SystemSettings()
        return SystemSettings(
            id=model.id,
            active_llm_model=model.active_llm_model,
            ollama_url=model.ollama_url,
            docs_path=model.docs_path,
            embedding_model=model.embedding_model,
            temperature=model.temperature,
        )

    async def save_settings(self, settings: SystemSettings) -> None:
        model = await self._session.get(SettingsModel, "default")
        if not model:
            model = SettingsModel(
                id="default",
                active_llm_model=settings.active_llm_model,
                ollama_url=settings.ollama_url,
                docs_path=settings.docs_path,
                embedding_model=settings.embedding_model,
                temperature=settings.temperature,
            )
            self._session.add(model)
        else:
            model.active_llm_model = settings.active_llm_model
            model.ollama_url = settings.ollama_url
            model.docs_path = settings.docs_path
            model.embedding_model = settings.embedding_model
            model.temperature = settings.temperature
        await self._session.commit()

