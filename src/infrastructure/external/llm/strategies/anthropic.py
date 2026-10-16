"""Anthropic Claude Cloud Client Strategy."""

from __future__ import annotations

from domain.llm.interfaces import ILLMClient
from infrastructure.external.llm.anthropic_client import AnthropicHttpClient
from infrastructure.external.llm.strategies.options import LLMOptions


class AnthropicLLMStrategy:
    """Strategy for Anthropic Claude Cloud API (+ Voyage AI Embeddings)."""

    def build_client(self, options: LLMOptions) -> ILLMClient:
        base_url = options.base_url or "https://api.anthropic.com/v1"
        model = options.default_model or "claude-sonnet-4-5"
        voyage_key = str(options.additional_params.get("voyage_api_key", ""))
        return AnthropicHttpClient(
            api_key=options.api_key,
            base_url=base_url,
            default_model=model,
            voyage_api_key=voyage_key,
        )

