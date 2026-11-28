"""SQLAlchemy Async Repository for Multi-LLM Provider Configurations (SRP/ISP)."""

from __future__ import annotations

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from domain.rag import SovereignRoutingPolicy
from domain.users import ILlmConfigRepositoryPort, LlmProviderConfigEntity
from infrastructure.persistence.models import LlmConfigurationORM


def _map_llm(r: LlmConfigurationORM) -> LlmProviderConfigEntity:
    egress = (getattr(r, "egress_class", "") or "").strip().lower()
    if egress not in {"local", "cloud"}:
        egress = SovereignRoutingPolicy.classify_egress(
            provider_engine_type=r.engine_type,
            base_url=r.cli_command if r.engine_type == "local_cli" else r.base_url,
            provider_name=r.provider,
        )
    return LlmProviderConfigEntity(
        provider=r.provider,
        engine_type=r.engine_type,
        name=r.name,
        base_url=r.base_url,
        api_key_encrypted=r.api_key_encrypted,
        default_model=r.default_model,
        cli_command=r.cli_command,
        cli_args=r.cli_args,
        temperature=r.temperature,
        max_tokens=r.max_tokens,
        egress_class=egress,
        is_active=r.is_active,
        updated_at=r.updated_at,
    )


class SqlLlmConfigRepository(ILlmConfigRepositoryPort):
    def __init__(self, session_maker: async_sessionmaker[AsyncSession]) -> None:
        self._sm = session_maker

    async def list_all(self) -> list[LlmProviderConfigEntity]:
        async with self._sm() as s:
            rows = (await s.execute(select(LlmConfigurationORM).order_by(LlmConfigurationORM.provider.asc()))).scalars().all()
            return [_map_llm(r) for r in rows]

    async def get_by_provider(self, provider: str) -> LlmProviderConfigEntity | None:
        async with self._sm() as s:
            r = (await s.execute(select(LlmConfigurationORM).where(LlmConfigurationORM.provider == provider))).scalar_one_or_none()
            return _map_llm(r) if r else None

    async def get_active(self) -> LlmProviderConfigEntity:
        async with self._sm() as s:
            r = (await s.execute(select(LlmConfigurationORM).where(LlmConfigurationORM.is_active.is_(True)))).scalars().first()
            if r is not None:
                return _map_llm(r)
            return LlmProviderConfigEntity(
                provider="ollama",
                engine_type="local_http",
                name="Ollama Local",
                base_url="http://127.0.0.1:11434",
                default_model="llama3.1:8b",
                is_active=True,
            )

    async def save(self, config: LlmProviderConfigEntity) -> LlmProviderConfigEntity:
        eff_egress = config.egress_class if config.egress_class in {"local", "cloud"} else SovereignRoutingPolicy.classify_egress(
            provider_engine_type=config.engine_type,
            base_url=config.cli_command if config.engine_type == "local_cli" else config.base_url,
            provider_name=config.provider,
        )
        async with self._sm() as s:
            r = (await s.execute(select(LlmConfigurationORM).where(LlmConfigurationORM.provider == config.provider))).scalar_one_or_none()
            if r is None:
                r = LlmConfigurationORM(
                    provider=config.provider,
                    engine_type=config.engine_type,
                    name=config.name,
                    base_url=config.base_url,
                    api_key_encrypted=config.api_key_encrypted,
                    default_model=config.default_model,
                    cli_command=config.cli_command,
                    cli_args=config.cli_args,
                    temperature=config.temperature,
                    max_tokens=config.max_tokens,
                    egress_class=eff_egress,
                    is_active=config.is_active,
                )
                s.add(r)
            else:
                r.engine_type = config.engine_type
                r.name = config.name
                r.base_url = config.base_url
                r.api_key_encrypted = config.api_key_encrypted
                r.default_model = config.default_model
                r.cli_command = config.cli_command
                r.cli_args = config.cli_args
                r.temperature = config.temperature
                r.max_tokens = config.max_tokens
                r.egress_class = eff_egress
                r.is_active = config.is_active
            await s.commit()
            return _map_llm(r)

    async def set_active(self, provider: str) -> LlmProviderConfigEntity | None:
        async with self._sm() as s:
            r = (await s.execute(select(LlmConfigurationORM).where(LlmConfigurationORM.provider == provider))).scalar_one_or_none()
            if r is None:
                return None
            await s.execute(update(LlmConfigurationORM).values(is_active=False))
            r.is_active = True
            await s.commit()
            return _map_llm(r)
