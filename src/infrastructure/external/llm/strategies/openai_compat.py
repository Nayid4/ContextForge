"""OpenAI-Compatible Local Server Strategy (LM Studio, vLLM, LocalAI)."""

from __future__ import annotations

from domain.llm.entities import LLMProvider
from domain.llm.interfaces import ILLMClient
from infrastructure.external.llm.openai_client import OpenAIHttpClient
from infrastructure.external.llm.strategies.options import LLMOptions


class OpenAICompatibleLLMStrategy:
    """Strategy for Local OpenAI-Compatible Servers (LM Studio, vLLM, LocalAI, Jan)."""

    _DEFAULT_URL_MAP: dict[LLMProvider, str] = {
        LLMProvider.LM_STUDIO: "http://localhost:1234/v1",
        LLMProvider.VLLM: "http://localhost:8000/v1",
        LLMProvider.LOCALAI: "http://localhost:8080/v1",
    }

    def build_client(self, options: LLMOptions) -> ILLMClient:
        base_url = options.base_url or self._DEFAULT_URL_MAP.get(
            options.provider, "http://localhost:1234/v1"
        )
        model = options.default_model or "qwen2.5-coder-7b-instruct"
        return OpenAIHttpClient(
            api_key=options.api_key or "local-key",
            base_url=base_url,
            default_model=model,
            require_api_key=False,
        )

