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

