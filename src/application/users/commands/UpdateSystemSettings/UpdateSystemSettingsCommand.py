from __future__ import annotations
from dataclasses import dataclass
from application.common import ICommand
from domain.users import SystemSettingsEntity

@dataclass(frozen=True)
class UpdateSystemSettingsCommand(ICommand[SystemSettingsEntity]):
    active_llm_model: str | None = None
    ollama_url: str | None = None
    docs_path: str | None = None
    embedding_model: str | None = None
    temperature: float | None = None
    min_grounding_score: float | None = None
    enable_dlp_redaction: bool | None = None
    enable_extractive_fallback: bool | None = None
