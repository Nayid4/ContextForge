"""LLM Factory for dynamically instantiating LLM Client adapters."""

from __future__ import annotations

import logging
from domain.llm.entities import LLMConfiguration, LLMProvider
from domain.llm.interfaces import ILLMClient
from infrastructure.external.llm.anthropic_client import AnthropicHttpClient
from infrastructure.external.llm.gemini_client import GeminiHttpClient
from infrastructure.external.llm.openai_client import OpenAIHttpClient
from infrastructure.external.ollama_client import OllamaHttpClient

logger = logging.getLogger("infrastructure.llm.factory")


class LLMFactory:
    """Factory to create concrete ILLMClient instances from domain configurations."""

    @staticmethod
    def create_client(config: LLMConfiguration) -> ILLMClient:
        """Instantiate the corresponding ILLMClient adapter for the given configuration."""
        provider = config.provider

        if provider == LLMProvider.OLLAMA:
            base_url = config.base_url or "http://localhost:11434"
            return OllamaHttpClient(base_url=base_url)

        elif provider == LLMProvider.OPENAI:
            base_url = config.base_url or "https://api.openai.com/v1"
            model = config.default_model or "gpt-4o-mini"
            return OpenAIHttpClient(
                api_key=config.api_key,
                base_url=base_url,
                default_model=model,
            )

        elif provider == LLMProvider.ANTHROPIC:
            base_url = config.base_url or "https://api.anthropic.com/v1"
            model = config.default_model or "claude-3-5-sonnet-20241022"
            return AnthropicHttpClient(
                api_key=config.api_key,
                base_url=base_url,
                default_model=model,
            )

        elif provider == LLMProvider.DEEPSEEK:
            base_url = config.base_url or "https://api.deepseek.com"
            model = config.default_model or "deepseek-chat"
            return OpenAIHttpClient(
                api_key=config.api_key,
                base_url=base_url,
                default_model=model,
            )

        elif provider == LLMProvider.GEMINI:
            base_url = config.base_url or "https://generativelanguage.googleapis.com/v1beta/openai"
            model = config.default_model or "gemini-1.5-flash"
            return GeminiHttpClient(
                api_key=config.api_key,
                base_url=base_url,
                default_model=model,
            )

        logger.warning("Unrecognized provider %s, falling back to Ollama", provider)
        return OllamaHttpClient(base_url="http://localhost:11434")

