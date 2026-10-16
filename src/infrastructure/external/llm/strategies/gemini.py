"""Google Gemini Cloud Client Strategy."""

from __future__ import annotations

from domain.llm.interfaces import ILLMClient
from infrastructure.external.llm.gemini_client import GeminiHttpClient
from infrastructure.external.llm.strategies.options import LLMOptions


class GeminiLLMStrategy:
    """Strategy for Google Gemini Cloud API (Native v1beta/models + Gemini Embeddings 2)."""

    def build_client(self, options: LLMOptions) -> ILLMClient:
        base_url = options.base_url or "https://generativelanguage.googleapis.com/v1beta"
        model = options.default_model or "gemini-2.5-flash"
        return GeminiHttpClient(
            api_key=options.api_key,
            base_url=base_url,
            default_model=model,
        )

