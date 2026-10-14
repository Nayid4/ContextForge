"""RAG Engine Domain Repository Interfaces with Multi-Project Isolation."""

from __future__ import annotations

from typing import Any, AsyncGenerator, Protocol
from domain.knowledge_docs.entities import DocumentChunk
from domain.rag_engine.entities import RetrievalResult, VectorEmbedding


class IVectorRepository(Protocol):
    """Protocol for dense vector store operations (ChromaDB) with multi-project isolation."""

    async def upsert_chunks(
        self,
        chunks: list[DocumentChunk],
        project_slug: str = "default",
        embeddings: list[list[float]] | None = None,
    ) -> None:
        ...

    async def search(
        self,
        query: str,
        project_slug: str = "default",
        top_k: int = 5,
        query_vector: list[float] | None = None,
    ) -> list[RetrievalResult]:
        ...

    async def count(self, project_slug: str = "default") -> int:
        ...

    async def clear_project(self, project_slug: str = "default") -> None:
        ...

    async def delete_project(self, project_slug: str) -> None:
        ...


class ILexicalIndexRepository(Protocol):
    """Protocol for lexical search operations (BM25Plus) with multi-project partitioning."""

    async def index_chunks(self, chunks: list[DocumentChunk], project_slug: str = "default") -> None:
        ...

    async def search(
        self,
        query: str,
        project_slug: str = "default",
        top_k: int = 5,
    ) -> list[RetrievalResult]:
        ...

    async def clear_project(self, project_slug: str) -> None:
        ...


class IOllamaClient(Protocol):
    """Protocol for sovereign local inference via Ollama."""

    async def get_installed_models(self) -> list[dict[str, Any]]:
        ...

    def stream_chat(
        self,
        model: str,
        messages: list[dict[str, str]],
        system_prompt: str | None = None,
    ) -> AsyncGenerator[str, None]:
        ...

    async def generate_completion(
        self,
        model: str,
        prompt: str,
        system_prompt: str | None = None,
    ) -> str:
        ...

    async def generate_embedding(self, model: str, text: str) -> list[float]:
        ...
