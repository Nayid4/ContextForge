"""SQL Repository for LLM Configurations."""

from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from domain.llm.entities import LLMConfiguration, LLMProvider
from domain.llm.repositories import ILLMConfigRepository
from infrastructure.persistence.models.llm_config_model import LLMConfigORM


DEFAULT_CONFIGS: dict[str, dict[str, str]] = {
    "ollama": {
        "name": "Ollama Local",
        "base_url": "http://localhost:11434",
        "default_model": "llama3.1:8b",
    },
    "openai": {
        "name": "OpenAI (ChatGPT)",
        "base_url": "https://api.openai.com/v1",
        "default_model": "gpt-4o-mini",
    },
    "anthropic": {
        "name": "Anthropic (Claude)",
        "base_url": "https://api.anthropic.com/v1",
        "default_model": "claude-3-5-sonnet-20241022",
    },
    "deepseek": {
        "name": "DeepSeek API",
        "base_url": "https://api.deepseek.com",
        "default_model": "deepseek-chat",
    },
    "gemini": {
        "name": "Google Gemini",
        "base_url": "https://generativelanguage.googleapis.com/v1beta/openai",
        "default_model": "gemini-1.5-flash",
    },
}


class SqlLLMConfigRepository(ILLMConfigRepository):
    """SQLAlchemy implementation of ILLMConfigRepository."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _to_entity(self, orm: LLMConfigORM) -> LLMConfiguration:
        try:
            prov = LLMProvider(orm.provider)
        except ValueError:
            prov = LLMProvider.OLLAMA

        return LLMConfiguration(
            id=orm.provider,
            provider=prov,
            name=orm.name,
            api_key=orm.api_key,
            base_url=orm.base_url,
            default_model=orm.default_model,
            is_active=orm.is_active,
            temperature=orm.temperature,
            max_tokens=orm.max_tokens,
            updated_at=orm.updated_at,
        )

    async def get_all(self) -> list[LLMConfiguration]:
        """Fetch all provider configurations or seed defaults if not populated."""
        stmt = select(LLMConfigORM).order_by(LLMConfigORM.provider)
        res = await self._session.execute(stmt)
        orms = list(res.scalars().all())

        existing_providers = {o.provider for o in orms}
        # Check if any default providers are missing and seed them
        missing = [p for p in DEFAULT_CONFIGS if p not in existing_providers]
        if missing:
            for p in missing:
                data = DEFAULT_CONFIGS[p]
                new_orm = LLMConfigORM(
                    provider=p,
                    name=data["name"],
                    api_key="",
                    base_url=data["base_url"],
                    default_model=data["default_model"],
                    is_active=(p == "ollama" and not any(o.is_active for o in orms)),
                    temperature=0.2,
                    max_tokens=4096,
                )
                self._session.add(new_orm)
                orms.append(new_orm)
            await self._session.commit()

        return [self._to_entity(o) for o in orms]

    async def get_by_provider(self, provider: LLMProvider) -> LLMConfiguration | None:
        """Fetch configuration for a specific provider."""
        stmt = select(LLMConfigORM).where(LLMConfigORM.provider == provider.value)
        res = await self._session.execute(stmt)
        orm = res.scalars().first()
        if orm:
            return self._to_entity(orm)

        # Create on demand if registered in defaults
        if provider.value in DEFAULT_CONFIGS:
            data = DEFAULT_CONFIGS[provider.value]
            new_orm = LLMConfigORM(
                provider=provider.value,
                name=data["name"],
                api_key="",
                base_url=data["base_url"],
                default_model=data["default_model"],
                is_active=False,
                temperature=0.2,
                max_tokens=4096,
            )
            self._session.add(new_orm)
            await self._session.commit()
            return self._to_entity(new_orm)

        return None

    async def get_active(self) -> LLMConfiguration:
        """Retrieve the currently active LLM provider configuration."""
        stmt = select(LLMConfigORM).where(LLMConfigORM.is_active.is_(True))
        res = await self._session.execute(stmt)
        orm = res.scalars().first()
        if orm:
            return self._to_entity(orm)

        # Fallback to Ollama
        all_configs = await self.get_all()
        for cfg in all_configs:
            if cfg.provider == LLMProvider.OLLAMA:
                cfg.is_active = True
                await self.save(cfg)
                return cfg

        return LLMConfiguration(
            provider=LLMProvider.OLLAMA,
            name="Ollama Local",
            base_url="http://localhost:11434",
            default_model="llama3.1:8b",
            is_active=True,
        )

    async def save(self, config: LLMConfiguration) -> None:
        """Upsert a provider configuration."""
        stmt = select(LLMConfigORM).where(LLMConfigORM.provider == config.provider.value)
        res = await self._session.execute(stmt)
        orm = res.scalars().first()

        now = datetime.now(timezone.utc)
        if orm:
            orm.name = config.name
            if config.api_key:  # Only update key if provided
                orm.api_key = config.api_key
            orm.base_url = config.base_url
            orm.default_model = config.default_model
            orm.is_active = config.is_active
            orm.temperature = config.temperature
            orm.max_tokens = config.max_tokens
            orm.updated_at = now
        else:
            orm = LLMConfigORM(
                provider=config.provider.value,
                name=config.name,
                api_key=config.api_key,
                base_url=config.base_url,
                default_model=config.default_model,
                is_active=config.is_active,
                temperature=config.temperature,
                max_tokens=config.max_tokens,
                updated_at=now,
            )
            self._session.add(orm)

        await self._session.commit()

    async def set_active_provider(self, provider: LLMProvider) -> None:
        """Set active provider atomically and deactivate all others."""
        # Deactivate all
        await self._session.execute(
            update(LLMConfigORM).values(is_active=False)
        )
        # Activate target
        stmt = select(LLMConfigORM).where(LLMConfigORM.provider == provider.value)
        res = await self._session.execute(stmt)
        orm = res.scalars().first()
        if orm:
            orm.is_active = True
        else:
            data = DEFAULT_CONFIGS.get(provider.value, {"name": provider.value, "base_url": "", "default_model": ""})
            orm = LLMConfigORM(
                provider=provider.value,
                name=data["name"],
                api_key="",
                base_url=data["base_url"],
                default_model=data["default_model"],
                is_active=True,
            )
            self._session.add(orm)

        await self._session.commit()

