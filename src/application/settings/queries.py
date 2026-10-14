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

