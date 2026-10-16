"""Protocol contracts for LLM Client and Embedding Strategies."""

from __future__ import annotations

from typing import Any, Protocol
from domain.llm.interfaces import ILLMClient
from infrastructure.external.llm.strategies.options import EmbeddingOptions, LLMOptions


class ILLMClientStrategy(Protocol):
    """Strategy Pattern: Builds an ILLMClient from LLMOptions."""

    def build_client(self, options: LLMOptions) -> ILLMClient:
        """Instantiate concrete ILLMClient adapter."""
        ...


class IEmbeddingStrategy(Protocol):
    """Strategy Pattern: Tests and validates vector generation for an embedding ecosystem."""

    async def test_embedding(self, options: EmbeddingOptions) -> dict[str, Any]:
        """Verify embedding generation and return diagnostic summary."""
        ...

