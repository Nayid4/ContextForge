"""Factory selecting the active ILLMProviderPort strategy."""

from __future__ import annotations

from domain.ports import ISecretVault
from domain.rag import ILLMProviderPort
from domain.users import LlmProviderConfigEntity
from infrastructure.config.env_file_loader import EnvFileLoader
from infrastructure.integrations.llm.cli_llm_adapter import CliLlmAdapter
from infrastructure.integrations.llm.extractive_fallback_adapter import ExtractiveFallbackAdapter
from infrastructure.integrations.llm.http_multi_llm_adapter import HttpMultiLlmAdapter


class AIStrategyFactory:
    @staticmethod
    def create(config: LlmProviderConfigEntity, vault: ISecretVault, timeout_sec: float = 25.0) -> ILLMProviderPort:
        if config.provider == "extractive_fallback" or config.engine_type == "extractive_fallback":
            return ExtractiveFallbackAdapter()
        if config.engine_type == "local_cli" or config.provider.endswith("_cli"):
            return CliLlmAdapter(config, timeout_sec=max(timeout_sec, 120.0))
        decrypted = vault.decrypt(config.api_key_encrypted) if config.api_key_encrypted else ""
        eff_key, _ = EnvFileLoader.resolve_provider_api_key(config.provider, decrypted)
        return HttpMultiLlmAdapter(config, api_key_plain=eff_key, timeout_sec=timeout_sec)
