"""Settings Application Queries."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class GetSettingsQuery:
    """Query to retrieve system configuration."""
    pass


@dataclass(frozen=True)
class GetOllamaModelsQuery:
    """Query to detect all installed LLM models from the local Ollama instance."""
    pass


@dataclass(frozen=True)
class GetLLMConfigsQuery:
    """Query to retrieve all registered LLM provider configurations."""
    pass


@dataclass(frozen=True)
class GetActiveLLMConfigQuery:
    """Query to retrieve the currently active LLM provider configuration."""
    pass


