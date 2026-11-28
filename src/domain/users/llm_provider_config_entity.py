"""Multi-LLM provider configuration storing encrypted API key at rest (RF-CFG-002)."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass(frozen=True)
class LlmProviderConfigEntity:
    provider: str
    engine_type: str
    name: str
    base_url: str
    api_key_encrypted: str = ""
    default_model: str = ""
    cli_command: str = ""
    cli_args: str = ""
    temperature: float = 0.2
    max_tokens: int = 4096
    egress_class: str = ""  # 'local' | 'cloud' (explicit BR-21 classification)
    is_active: bool = False
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
