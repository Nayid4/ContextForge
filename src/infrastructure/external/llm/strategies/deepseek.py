"""DeepSeek Cloud Client Strategy."""

from __future__ import annotations

from domain.llm.interfaces import ILLMClient
from infrastructure.external.llm.openai_client import OpenAIHttpClient
from infrastructure.external.llm.strategies.options import LLMOptions


class DeepSeekLLMStrategy:
    """Strategy for DeepSeek Official Cloud API."""

    def build_client(self, options: LLMOptions) -> ILLMClient:
        base_url = options.base_url or "https://api.deepseek.com"
        model = options.default_model or "deepseek-chat"
        return OpenAIHttpClient(
            api_key=options.api_key,
            base_url=base_url,
            default_model=model,
            require_api_key=True,
        )

