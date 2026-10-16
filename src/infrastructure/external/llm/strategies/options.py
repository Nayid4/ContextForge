"""Options Pattern for LLM and Embedding Configurations."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any
from domain.llm.entities import EngineType, LLMConfiguration, LLMProvider


@dataclass(frozen=True)
class LLMOptions:
    """Options Pattern: Strongly-typed parameters for instantiating an LLM Client."""

    provider: LLMProvider
    engine_type: EngineType = EngineType.CLOUD_API
    base_url: str = ""
    api_key: str = ""
    default_model: str = ""
    cli_command: str = ""
    cli_args: str = ""
    additional_params: dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_config(cls, config: LLMConfiguration) -> LLMOptions:
        """Construct strongly-typed LLMOptions from domain LLMConfiguration."""
        return cls(
            provider=config.provider,
            engine_type=config.engine_type,
            base_url=config.base_url or "",
            api_key=config.api_key or "",
            default_model=config.default_model or "",
            cli_command=config.cli_command or "",
            cli_args=config.cli_args or "",
            additional_params=dict(config.additional_params or {}),
        )


@dataclass(frozen=True)
class EmbeddingOptions:
    """Options Pattern: Strongly-typed parameters for vector embedding testing and generation."""

    provider: str
    model: str
    api_key: str = ""
    base_url: str = ""
    dimensions: int = 768
    sample_text: str = "ContextForge Docs-as-Code Architecture Specification"
    timeout_seconds: float = 15.0

