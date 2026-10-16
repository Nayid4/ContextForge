"""SQL Repository for Universal LLM & CLI Configurations."""

from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from domain.llm.entities import (
    EngineType,
    LLMConfiguration,
    LLMProvider,
    infer_engine_type,
    sanitize_api_key,
)
from domain.llm.repositories import ILLMConfigRepository
from infrastructure.external.llm.gemini_client import normalize_gemini_base_url
from infrastructure.persistence.models.llm_config_model import LLMConfigORM


DEFAULT_CONFIGS: dict[str, dict[str, str]] = {
    # 1. Local HTTP Servers (Inferencia Local de Modelos)
    "ollama": {
        "name": "Ollama Server Local",
        "engine_type": "local_http",
        "base_url": "http://localhost:11434",
        "default_model": "llama3.1:8b",
        "cli_command": "",
        "cli_args": "",
    },
    "lm_studio": {
        "name": "LM Studio Server (OpenAI Local)",
        "engine_type": "local_http",
        "base_url": "http://localhost:1234/v1",
        "default_model": "qwen2.5-coder-7b-instruct",
        "cli_command": "",
        "cli_args": "",
    },
    "vllm": {
        "name": "vLLM Server (High-Throughput)",
        "engine_type": "local_http",
        "base_url": "http://localhost:8000/v1",
        "default_model": "Qwen/Qwen3-Coder-30B-A3B-Instruct",
        "cli_command": "",
        "cli_args": "",
    },
    "localai": {
        "name": "LocalAI / Jan Server",
        "engine_type": "local_http",
        "base_url": "http://localhost:8080/v1",
        "default_model": "llama-3.1-8b-instruct",
        "cli_command": "",
        "cli_args": "",
    },
    # 2. Cloud APIs Comerciales
    "gemini": {
        "name": "Google Gemini API (AI Studio)",
        "engine_type": "cloud_api",
        "base_url": "https://generativelanguage.googleapis.com/v1beta",
        "default_model": "gemini-2.5-flash",
        "cli_command": "",
        "cli_args": "",
    },
    "openai": {
        "name": "OpenAI API (ChatGPT / Responses)",
        "engine_type": "cloud_api",
        "base_url": "https://api.openai.com/v1",
        "default_model": "gpt-4o-mini",
        "cli_command": "",
        "cli_args": "",
    },
    "anthropic": {
        "name": "Anthropic Claude API",
        "engine_type": "cloud_api",
        "base_url": "https://api.anthropic.com/v1",
        "default_model": "claude-sonnet-4-5",
        "cli_command": "",
        "cli_args": "",
    },
    "deepseek": {
        "name": "DeepSeek API (V3 / R1)",
        "engine_type": "cloud_api",
        "base_url": "https://api.deepseek.com",
        "default_model": "deepseek-chat",
        "cli_command": "",
        "cli_args": "",
    },
    # 3. Local CLI Agents & Tools
    "antigravity_cli": {
        "name": "Google Antigravity CLI (agy)",
        "engine_type": "local_cli",
        "base_url": "",
        "default_model": "gemini-3.8-flash",
        "cli_command": "agy",
        "cli_args": "-p",
    },
    "claude_code_cli": {
        "name": "Anthropic Claude Code CLI",
        "engine_type": "local_cli",
        "base_url": "",
        "default_model": "claude-sonnet-4-5",
        "cli_command": "claude",
        "cli_args": "--output-format text",
    },
    "open_code_cli": {
        "name": "OpenCode v2 CLI Agent",
        "engine_type": "local_cli",
        "base_url": "",
        "default_model": "anthropic/claude-sonnet-4-5",
        "cli_command": "opencode",
        "cli_args": "run",
    },
    "codex_cli": {
        "name": "OpenAI Codex CLI",
        "engine_type": "local_cli",
        "base_url": "",
        "default_model": "gpt-5.4",
        "cli_command": "codex",
        "cli_args": "-p",
    },
    "gemini_cli": {
        "name": "Google Gemini CLI",
        "engine_type": "local_cli",
        "base_url": "",
        "default_model": "gemini-2.5-pro",
        "cli_command": "gemini",
        "cli_args": "-p",
    },
    "aider_cli": {
        "name": "Aider AI Pair Programmer",
        "engine_type": "local_cli",
        "base_url": "",
        "default_model": "qwen2.5-coder",
        "cli_command": "aider",
        "cli_args": "--message",
    },
    "ollama_cli": {
        "name": "Ollama Terminal CLI Nativo",
        "engine_type": "local_cli",
        "base_url": "",
        "default_model": "llama3.1:8b",
        "cli_command": "ollama",
        "cli_args": "run",
    },
}


class SqlLLMConfigRepository(ILLMConfigRepository):
    """SQLAlchemy implementation of ILLMConfigRepository."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _upgrade_legacy_orm(self, orm: LLMConfigORM) -> bool:
        """Normalize legacy defaults (antigravity -> agy, open-code -> opencode, gemini /interactions -> /v1beta)."""
        changed = False
        if orm.provider == "antigravity_cli" and orm.cli_command in ("antigravity", ""):
            orm.cli_command = "agy"
            orm.name = "Google Antigravity CLI (agy)"
            if orm.cli_args == "run -p":
                orm.cli_args = "-p"
            changed = True
        elif orm.provider == "open_code_cli" and orm.cli_command in ("open-code", ""):
            orm.cli_command = "opencode"
            orm.name = "OpenCode v2 CLI Agent"
            changed = True
        elif orm.provider == "gemini":
            normalized = normalize_gemini_base_url(orm.base_url)
            if orm.base_url != normalized:
                orm.base_url = normalized
                changed = True
            if orm.default_model == "gemini-1.5-flash":
                orm.default_model = "gemini-2.5-flash"
                changed = True
        return changed

    def _to_entity(self, orm: LLMConfigORM) -> LLMConfiguration:
        try:
            prov = LLMProvider(orm.provider)
        except ValueError:
            prov = LLMProvider.OLLAMA

        raw_engine_type = getattr(orm, "engine_type", "") or ""
        try:
            eng = EngineType(raw_engine_type) if raw_engine_type else infer_engine_type(prov)
        except ValueError:
            eng = infer_engine_type(prov)

        return LLMConfiguration(
            id=orm.provider,
            provider=prov,
            engine_type=eng,
            name=orm.name,
            api_key=orm.api_key,
            base_url=orm.base_url,
            default_model=orm.default_model,
            cli_command=getattr(orm, "cli_command", "") or "",
            cli_args=getattr(orm, "cli_args", "") or "",
            is_active=orm.is_active,
            temperature=orm.temperature,
            max_tokens=orm.max_tokens,
            updated_at=orm.updated_at,
        )

    async def get_all(self) -> list[LLMConfiguration]:
        """Fetch all provider configurations or seed defaults if not populated."""
        stmt = select(LLMConfigORM)
        res = await self._session.execute(stmt)
        orms = list(res.scalars().all())

        dirty = False
        for o in orms:
            if self._upgrade_legacy_orm(o):
                dirty = True

        existing_providers = {o.provider for o in orms}
        missing = [p for p in DEFAULT_CONFIGS if p not in existing_providers]
        if missing:
            for p in missing:
                data = DEFAULT_CONFIGS[p]
                new_orm = LLMConfigORM(
                    provider=p,
                    engine_type=data["engine_type"],
                    name=data["name"],
                    api_key="",
                    base_url=data["base_url"],
                    default_model=data["default_model"],
                    cli_command=data["cli_command"],
                    cli_args=data["cli_args"],
                    is_active=(p == "ollama" and not any(o.is_active for o in orms)),
                    temperature=0.2,
                    max_tokens=4096,
                )
                self._session.add(new_orm)
                orms.append(new_orm)
            dirty = True

        if dirty:
            await self._session.commit()

        order_keys = list(DEFAULT_CONFIGS.keys())
        orms.sort(key=lambda item: order_keys.index(item.provider) if item.provider in order_keys else 999)
        return [self._to_entity(o) for o in orms]

    async def get_by_provider(self, provider: LLMProvider) -> LLMConfiguration | None:
        """Fetch configuration for a specific provider."""
        target_key = "ollama" if provider == LLMProvider.OLLAMA_HTTP else provider.value
        stmt = select(LLMConfigORM).where(LLMConfigORM.provider == target_key)
        res = await self._session.execute(stmt)
        orm = res.scalars().first()
        if orm:
            if self._upgrade_legacy_orm(orm):
                await self._session.commit()
            return self._to_entity(orm)

        if target_key in DEFAULT_CONFIGS:
            data = DEFAULT_CONFIGS[target_key]
            new_orm = LLMConfigORM(
                provider=target_key,
                engine_type=data["engine_type"],
                name=data["name"],
                api_key="",
                base_url=data["base_url"],
                default_model=data["default_model"],
                cli_command=data["cli_command"],
                cli_args=data["cli_args"],
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
            if self._upgrade_legacy_orm(orm):
                await self._session.commit()
            return self._to_entity(orm)

        all_configs = await self.get_all()
        for cfg in all_configs:
            if cfg.provider == LLMProvider.OLLAMA:
                cfg.is_active = True
                await self.save(cfg)
                return cfg

        return LLMConfiguration(
            provider=LLMProvider.OLLAMA,
            engine_type=EngineType.LOCAL_HTTP,
            name="Ollama Server Local",
            base_url="http://localhost:11434",
            default_model="llama3.1:8b",
            is_active=True,
        )

    async def save(self, config: LLMConfiguration) -> None:
        """Upsert a provider configuration while preserving real API keys if masked input is passed."""
        target_key = "ollama" if config.provider == LLMProvider.OLLAMA_HTTP else config.provider.value
        stmt = select(LLMConfigORM).where(LLMConfigORM.provider == target_key)
        res = await self._session.execute(stmt)
        orm = res.scalars().first()

        clean_key = sanitize_api_key(config.api_key)
        base_url = (
            normalize_gemini_base_url(config.base_url)
            if target_key == "gemini"
            else config.base_url
        )
        cli_cmd = config.cli_command
        if target_key == "antigravity_cli" and cli_cmd == "antigravity":
            cli_cmd = "agy"
        elif target_key == "open_code_cli" and cli_cmd == "open-code":
            cli_cmd = "opencode"

        now = datetime.now(timezone.utc)
        if orm:
            orm.name = config.name
            orm.engine_type = config.engine_type.value
            if clean_key:
                orm.api_key = clean_key
            orm.base_url = base_url
            orm.default_model = config.default_model
            orm.cli_command = cli_cmd
            orm.cli_args = config.cli_args
            orm.is_active = config.is_active
            orm.temperature = config.temperature
            orm.max_tokens = config.max_tokens
            orm.updated_at = now
        else:
            orm = LLMConfigORM(
                provider=target_key,
                engine_type=config.engine_type.value,
                name=config.name,
                api_key=clean_key,
                base_url=base_url,
                default_model=config.default_model,
                cli_command=cli_cmd,
                cli_args=config.cli_args,
                is_active=config.is_active,
                temperature=config.temperature,
                max_tokens=config.max_tokens,
                updated_at=now,
            )
            self._session.add(orm)

        await self._session.commit()

    async def set_active_provider(self, provider: LLMProvider) -> None:
        """Set active provider atomically and deactivate all others."""
        target_key = "ollama" if provider == LLMProvider.OLLAMA_HTTP else provider.value
        await self._session.execute(
            update(LLMConfigORM).values(is_active=False)
        )
        stmt = select(LLMConfigORM).where(LLMConfigORM.provider == target_key)
        res = await self._session.execute(stmt)
        orm = res.scalars().first()
        if orm:
            orm.is_active = True
        else:
            data = DEFAULT_CONFIGS.get(
                target_key,
                {
                    "name": target_key,
                    "engine_type": infer_engine_type(provider).value,
                    "base_url": "",
                    "default_model": "",
                    "cli_command": "",
                    "cli_args": "",
                },
            )
            orm = LLMConfigORM(
                provider=target_key,
                engine_type=data["engine_type"],
                name=data["name"],
                api_key="",
                base_url=data["base_url"],
                default_model=data["default_model"],
                cli_command=data["cli_command"],
                cli_args=data["cli_args"],
                is_active=True,
            )
            self._session.add(orm)

        await self._session.commit()
