from __future__ import annotations
from dataclasses import dataclass
import os

@dataclass(frozen=True)
class AiOptions:
    ai_provider: str = "ollama"  # ollama | openai | gemini | anthropic | cli | extractive_fallback
    ollama_base_url: str = "http://127.0.0.1:11434"
    default_llm_model: str = "llama3.1:8b"
    default_embedding_model: str = "nomic-embed-text"
    temperature: float = 0.2
    max_tokens: int = 4096
    timeout_seconds: float = 30.0
    min_grounding_score: float = 0.15
    enable_dlp_redaction: bool = True
    enable_extractive_fallback: bool = True

    @classmethod
    def from_env(cls) -> AiOptions:
        return cls(
            ai_provider=os.getenv("AI_PROVIDER", "ollama").lower(),
            ollama_base_url=os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434"),
            default_llm_model=os.getenv("DEFAULT_LLM_MODEL", "llama3.1:8b"),
            default_embedding_model=os.getenv("DEFAULT_EMBEDDING_MODEL", "nomic-embed-text"),
            temperature=float(os.getenv("LLM_TEMPERATURE", "0.2")),
            max_tokens=int(os.getenv("LLM_MAX_TOKENS", "4096")),
            timeout_seconds=float(os.getenv("LLM_TIMEOUT_SECONDS", "30.0")),
            min_grounding_score=float(os.getenv("RAG_MIN_GROUNDING_SCORE", "0.15")),
            enable_dlp_redaction=os.getenv("RAG_ENABLE_DLP_REDACTION", "true").lower() in ("1", "true", "yes"),
            enable_extractive_fallback=os.getenv("RAG_ENABLE_EXTRACTIVE_FALLBACK", "true").lower() in ("1", "true", "yes"),
        )
