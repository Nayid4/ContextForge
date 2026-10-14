"""Domain entities for Multi-LLM Provider Architecture."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any
from domain.shared_kernel.entities import Entity


class LLMProvider(str, Enum):
    """Supported LLM inference providers."""

    OLLAMA = "ollama"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    DEEPSEEK = "deepseek"
    GEMINI = "gemini"


@dataclass
class LLMConfiguration(Entity):
    """Configuration record for a specific LLM Provider."""

    provider: LLMProvider = LLMProvider.OLLAMA
    name: str = "Ollama Local"
    api_key: str = ""
    base_url: str = "http://localhost:11434"
    default_model: str = "llama3.1:8b"
    is_active: bool = False
    temperature: float = 0.2
    max_tokens: int = 4096
    additional_params: dict[str, Any] = field(default_factory=dict)
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def mask_api_key(self) -> str:
        """Return securely masked API key for safe presentation in UI."""
        if not self.api_key:
            return ""
        if len(self.api_key) <= 8:
            return "••••••••"
        return f"{self.api_key[:4]}••••••••{self.api_key[-4:]}"

    def to_dict(self, mask_key: bool = True) -> dict[str, Any]:
        """Serialize configuration for API responses and client presentation."""
        return {
            "id": self.id or self.provider.value,
            "provider": self.provider.value,
            "name": self.name,
            "api_key": self.mask_api_key() if mask_key else self.api_key,
            "has_api_key": bool(self.api_key),
            "base_url": self.base_url,
            "default_model": self.default_model,
            "is_active": self.is_active,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "additional_params": self.additional_params,
            "updated_at": self.updated_at.isoformat(),
        }

