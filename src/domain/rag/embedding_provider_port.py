"""Dense semantic embedding provider port (DIP) decoupling RAG retrieval from concrete embedding engines."""

from __future__ import annotations

from typing import Protocol, Sequence


class IEmbeddingProviderPort(Protocol):
    @property
    def provider_name(self) -> str: ...

    @property
    def model_name(self) -> str: ...

    async def embed_texts(self, texts: Sequence[str]) -> list[list[float]]: ...
