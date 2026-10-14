"""Settings Domain Entities."""

from __future__ import annotations

from dataclasses import dataclass
from domain.shared_kernel.entities import Entity


@dataclass
class SystemSettings(Entity):
    """System configuration for ContextForge."""

    id: str = "default"
    active_llm_model: str = "llama3.1:8b"
    ollama_url: str = "http://localhost:11434"
    docs_path: str = "./docs"
    embedding_model: str = "nomic-embed-text"
    temperature: float = 0.2

