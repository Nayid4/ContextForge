"""Global ContextForge RAG & governance runtime parameters."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass(frozen=True)
class SystemSettingsEntity:
    id: str = "default"
    active_llm_model: str = "llama3.1:8b"
    ollama_url: str = "http://127.0.0.1:11434"
    docs_path: str = "./docs"
    embedding_model: str = "nomic-embed-text"
    temperature: float = 0.2
    min_grounding_score: float = 0.15
    enable_dlp_redaction: bool = True
    enable_extractive_fallback: bool = True
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
