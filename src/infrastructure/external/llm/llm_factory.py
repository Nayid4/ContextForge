"""Hexagonal LLM & Embedding Factory using Strategy, Options, and Registry Patterns."""

from __future__ import annotations

import logging
from typing import Any
from domain.llm.entities import EngineType, LLMConfiguration, LLMProvider
from domain.llm.interfaces import ILLMClient
from infrastructure.external.llm.strategies import (
    AnthropicLLMStrategy,
    AnthropicVoyageEmbeddingStrategy,
    CliLLMStrategy,
    DeepSeekLLMStrategy,
    EmbeddingOptions,
    GeminiEmbeddingStrategy,
    GeminiLLMStrategy,
    IEmbeddingStrategy,
    ILLMClientStrategy,
    LLMOptions,
    OllamaEmbeddingStrategy,
    OllamaLLMStrategy,
    OpenAICloudLLMStrategy,
    OpenAICompatibleEmbeddingStrategy,
    OpenAICompatibleLLMStrategy,
)

logger = logging.getLogger("infrastructure.llm.factory")


class LLMFactory:
    """Factory to create concrete ILLMClient instances and test vector embeddings dynamically.

    Patterns Applied:
    - Factory Pattern: Resolves appropriate strategy based on EngineType / Provider.
    - Strategy Pattern: Concrete client/embedding strategies execute the underlying logic.
    - Options Pattern: Configurations are transformed into strongly-typed options.
    - Registry Pattern: Enables registering new providers without modifying existing code.
    """

    _cli_strategy = CliLLMStrategy()
    _ollama_strategy = OllamaLLMStrategy()
    _openai_compat_strategy = OpenAICompatibleLLMStrategy()
    _openai_cloud_strategy = OpenAICloudLLMStrategy()
    _deepseek_strategy = DeepSeekLLMStrategy()
    _anthropic_strategy = AnthropicLLMStrategy()
    _gemini_strategy = GeminiLLMStrategy()

    _CLIENT_STRATEGIES: dict[LLMProvider, ILLMClientStrategy] = {
        # Autonomous CLI Agents
        LLMProvider.ANTIGRAVITY_CLI: _cli_strategy,
        LLMProvider.CLAUDE_CODE_CLI: _cli_strategy,
        LLMProvider.OPEN_CODE_CLI: _cli_strategy,
        LLMProvider.CODEX_CLI: _cli_strategy,
        LLMProvider.GEMINI_CLI: _cli_strategy,
        LLMProvider.AIDER_CLI: _cli_strategy,
        LLMProvider.OLLAMA_CLI: _cli_strategy,
        # Native Local Ollama HTTP
        LLMProvider.OLLAMA: _ollama_strategy,
        LLMProvider.OLLAMA_HTTP: _ollama_strategy,
        # Local OpenAI-Compatible
        LLMProvider.LM_STUDIO: _openai_compat_strategy,
        LLMProvider.VLLM: _openai_compat_strategy,
        LLMProvider.LOCALAI: _openai_compat_strategy,
        # Commercial Cloud APIs
        LLMProvider.OPENAI: _openai_cloud_strategy,
        LLMProvider.DEEPSEEK: _deepseek_strategy,
        LLMProvider.ANTHROPIC: _anthropic_strategy,
        LLMProvider.GEMINI: _gemini_strategy,
    }

    _gemini_emb = GeminiEmbeddingStrategy()
    _openai_emb = OpenAICompatibleEmbeddingStrategy()
    _voyage_emb = AnthropicVoyageEmbeddingStrategy()
    _ollama_emb = OllamaEmbeddingStrategy()

    _EMBEDDING_STRATEGIES: dict[str, IEmbeddingStrategy] = {
        "gemini": _gemini_emb,
        "openai": _openai_emb,
        "lm_studio": _openai_emb,
        "localai": _openai_emb,
        "voyage": _voyage_emb,
        "anthropic": _voyage_emb,
        "ollama": _ollama_emb,
    }

    @classmethod
    def register_client_strategy(cls, provider: LLMProvider, strategy: ILLMClientStrategy) -> None:
        """Register or override a client strategy (Open/Closed Principle)."""
        cls._CLIENT_STRATEGIES[provider] = strategy
        logger.info("Registered LLM client strategy for %s: %s", provider, strategy.__class__.__name__)

    @classmethod
    def register_embedding_strategy(cls, provider_key: str, strategy: IEmbeddingStrategy) -> None:
        """Register or override an embedding strategy (Open/Closed Principle)."""
        cls._EMBEDDING_STRATEGIES[provider_key.lower()] = strategy
        logger.info("Registered embedding strategy for %s: %s", provider_key, strategy.__class__.__name__)

    @classmethod
    def create_client(cls, config: LLMConfiguration) -> ILLMClient:
        """Instantiate the corresponding ILLMClient adapter for the given configuration."""
        options = LLMOptions.from_config(config)

        # 1. Local CLI Agents take priority if engine_type == LOCAL_CLI
        if options.engine_type == EngineType.LOCAL_CLI:
            return cls._cli_strategy.build_client(options)

        # 2. Strategy lookup by provider
        strategy = cls._CLIENT_STRATEGIES.get(options.provider)
        if strategy:
            return strategy.build_client(options)

        # 3. Fallback to Ollama strategy
        logger.warning("Unrecognized provider %s, falling back to Ollama strategy", options.provider)
        return cls._ollama_strategy.build_client(options)

    @classmethod
    async def test_embedding_connection(
        cls,
        embedding_provider: str,
        embedding_model: str,
        api_key: str = "",
        base_url: str = "",
        dimensions: int = 768,
    ) -> dict[str, Any]:
        """Test vector embedding generation using the Strategy and Options patterns."""
        prov_key = (embedding_provider or "ollama").strip().lower()
        options = EmbeddingOptions(
            provider=prov_key,
            model=embedding_model,
            api_key=api_key,
            base_url=base_url,
            dimensions=dimensions,
        )

        strategy = cls._EMBEDDING_STRATEGIES.get(prov_key, cls._ollama_emb)
        return await strategy.test_embedding(options)


__all__ = [
    "AnthropicLLMStrategy",
    "AnthropicVoyageEmbeddingStrategy",
    "CliLLMStrategy",
    "DeepSeekLLMStrategy",
    "EmbeddingOptions",
    "GeminiEmbeddingStrategy",
    "GeminiLLMStrategy",
    "IEmbeddingStrategy",
    "ILLMClientStrategy",
    "LLMFactory",
    "LLMOptions",
    "OllamaEmbeddingStrategy",
    "OllamaLLMStrategy",
    "OpenAICloudLLMStrategy",
    "OpenAICompatibleEmbeddingStrategy",
    "OpenAICompatibleLLMStrategy",
]
