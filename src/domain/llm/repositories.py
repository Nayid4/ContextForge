"""Repository interfaces for LLM Configurations."""

from __future__ import annotations

from typing import Protocol
from domain.llm.entities import LLMConfiguration, LLMProvider


class ILLMConfigRepository(Protocol):
    """Protocol for persisting and retrieving multi-provider LLM configurations."""

    async def get_all(self) -> list[LLMConfiguration]:
        """Retrieve configurations for all registered providers."""
        ...

    async def get_by_provider(self, provider: LLMProvider) -> LLMConfiguration | None:
        """Retrieve configuration for a specific provider."""
        ...

    async def get_active(self) -> LLMConfiguration:
        """Retrieve the currently active LLM provider configuration."""
        ...

    async def save(self, config: LLMConfiguration) -> None:
        """Persist or update provider configuration."""
        ...

    async def set_active_provider(self, provider: LLMProvider) -> None:
        """Atomically set the active provider and deactivate all others."""
        ...

