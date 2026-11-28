"""Proxy resolving the active ILLMProviderPort dynamically per call without stale model overrides."""

from __future__ import annotations

from typing import TYPE_CHECKING, AsyncIterator

from infrastructure.integrations import AIStrategyFactory

if TYPE_CHECKING:
    from infrastructure.di.container import DependencyContainer


class DynamicPrimaryLlmProxy:
    def __init__(self, container: DependencyContainer) -> None:
        self._c = container
        self._last_provider: str = "dynamic_active_llm"
        self._last_engine_type: str = "local_http"
        self._last_base_url: str = container.settings.ai.ollama_base_url
        self._last_model: str = container.settings.ai.default_llm_model

    @property
    def provider_name(self) -> str:
        return self._last_provider

    @property
    def engine_type(self) -> str:
        return self._last_engine_type

    @property
    def base_url(self) -> str:
        return self._last_base_url

    @property
    def active_model_name(self) -> str:
        return self._last_model

    async def _resolve_adapter(self) -> tuple[object, str]:
        cfg = await self._c.llm_config_repo.get_active()
        self._last_provider = cfg.provider
        self._last_engine_type = cfg.engine_type
        self._last_base_url = cfg.base_url
        self._last_model = cfg.default_model or ""
        timeout = (
            max(self._c.settings.ai.timeout_seconds, 180.0)
            if cfg.engine_type == "local_cli"
            else max(self._c.settings.ai.timeout_seconds, 90.0)
        )
        adapter = AIStrategyFactory.create(cfg, self._c.vault, timeout_sec=timeout)
        return adapter, cfg.default_model

    async def generate(self, prompt: str, *, system_prompt: str | None = None, model: str | None = None) -> str:
        adapter, cfg_model = await self._resolve_adapter()
        # Always honor the active provider's configured default_model unless caller explicitly targets a compatible override
        eff_model = cfg_model or model
        return str(await adapter.generate(prompt, system_prompt=system_prompt, model=eff_model))  # type: ignore[attr-defined]

    async def stream_generate(self, prompt: str, *, system_prompt: str | None = None, model: str | None = None) -> AsyncIterator[str]:
        adapter, cfg_model = await self._resolve_adapter()
        eff_model = cfg_model or model
        async for tok in adapter.stream_generate(prompt, system_prompt=system_prompt, model=eff_model):  # type: ignore[attr-defined]
            yield tok

    async def check_health(self) -> tuple[bool, str, float]:
        adapter, _ = await self._resolve_adapter()
        return await adapter.check_health()  # type: ignore[attr-defined, no-any-return]
