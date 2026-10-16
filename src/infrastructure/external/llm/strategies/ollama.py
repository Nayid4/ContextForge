"""Ollama HTTP Client Strategy."""

from __future__ import annotations

from domain.llm.interfaces import ILLMClient
from infrastructure.external.llm.strategies.options import LLMOptions
from infrastructure.external.ollama_client import OllamaHttpClient


class OllamaLLMStrategy:
    """Strategy for Native Local Ollama HTTP Server."""

    def build_client(self, options: LLMOptions) -> ILLMClient:
        base_url = options.base_url or "http://localhost:11434"
        return OllamaHttpClient(base_url=base_url)

