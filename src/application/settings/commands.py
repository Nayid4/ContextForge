"""Settings Application Commands."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class UpdateSettingsCommand:
    """Command to update active LLM model and system configuration."""

    active_llm_model: str
    ollama_url: str = "http://localhost:11434"
    docs_path: str = "./docs"
    embedding_model: str = "nomic-embed-text"
    temperature: float = 0.2


@dataclass(frozen=True)
class SaveLLMConfigCommand:
    """Command to save or update an LLM provider configuration."""

    provider: str
    name: str
    api_key: str = ""
    base_url: str = ""
    default_model: str = ""
    temperature: float = 0.2
    max_tokens: int = 4096


@dataclass(frozen=True)
class ActivateLLMProviderCommand:
    """Command to activate an LLM provider and deactivate others."""

    provider: str


@dataclass(frozen=True)
class TestLLMConnectionCommand:
    """Command to test connection and latency with an LLM provider."""

    __test__ = False

    provider: str
    api_key: str = ""
    base_url: str = ""
    default_model: str = ""


