"""Public extension contracts (interfaces / ABCs) for ContextForge.

Third-party applications extend ContextForge by implementing any of these
contracts and registering or injecting them via :class:`ContextForge` or
:class:`ContextForgeBuilder` without modifying library source code (OCP & DIP).
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Sequence

from contextforge.models import (
    DocumentChunk,
    KnowledgeDocument,
    KnowledgeEvent,
    SearchHit,
)


class IChunkingStrategy(ABC):
    """Extension point for custom document segmentation algorithms (GoF Strategy)."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Unique strategy identifier used during registration and reporting."""

    @abstractmethod
    def chunk(self, document: KnowledgeDocument) -> list[DocumentChunk]:
        """Split a :class:`KnowledgeDocument` into indexable :class:`DocumentChunk` items."""


class IHybridRankingStrategy(ABC):
    """Extension point for hybrid retrieval fusion and reranking policies (GoF Strategy)."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Unique strategy identifier (e.g. ``'rrf'``, ``'weighted'``)."""

    @abstractmethod
    def fuse(
        self,
        lexical_hits: Sequence[SearchHit],
        vector_hits: Sequence[SearchHit],
        top_k: int,
    ) -> list[SearchHit]:
        """Merge lexical and vector candidate lists into a single ranked top-k list."""


class IBundleExporter(ABC):
    """Extension point for serializing Context Bundles to new formats (GoF Strategy/Factory)."""

    @property
    @abstractmethod
    def format_name(self) -> str:
        """Format key (e.g. ``'markdown'``, ``'json'``, ``'xml'``, ``'yaml'``)."""

    @abstractmethod
    def export(
        self,
        name: str,
        documents: Sequence[KnowledgeDocument],
        estimated_tokens: int,
        max_tokens: int,
    ) -> str:
        """Serialize selected documents into the target representation."""


class ILLMProvider(ABC):
    """Extension point for plugging in any LLM or AI agent backend (DIP)."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Human-readable identifier of the LLM provider (e.g. ``'ollama'``, ``'openai'``)."""

    @abstractmethod
    def generate(self, prompt: str, *, system_prompt: str | None = None) -> str:
        """Produce a grounded completion from the assembled RAG prompt."""


class IDocumentRule(ABC):
    """Extension point for composable ingestion governance rules (Chain of Responsibility)."""

    @property
    @abstractmethod
    def rule_name(self) -> str:
        """Unique identifier reported when validation fails."""

    @abstractmethod
    def validate(self, document: KnowledgeDocument) -> None:
        """Validate ``document`` or raise :class:`DocumentValidationError`."""


class ILexicalStore(ABC):
    """Replaceable port for lexical/BM25 chunk indexing and search."""

    @abstractmethod
    def index(self, chunks: Sequence[DocumentChunk]) -> None:
        """Add or update chunks in the lexical index."""

    @abstractmethod
    def search(self, query: str, top_k: int) -> list[SearchHit]:
        """Return top-k lexical matches scored by relevance."""

    @abstractmethod
    def clear(self) -> None:
        """Remove all indexed chunks."""


class IVectorStore(ABC):
    """Replaceable port for semantic/vector chunk indexing and similarity search."""

    @abstractmethod
    def index(self, chunks: Sequence[DocumentChunk]) -> None:
        """Add or update chunks in the vector index."""

    @abstractmethod
    def search(self, query: str, top_k: int) -> list[SearchHit]:
        """Return top-k semantic matches scored by similarity."""

    @abstractmethod
    def clear(self) -> None:
        """Remove all indexed chunks."""


class IKnowledgeObserver(ABC):
    """Extension point for observing knowledge lifecycle events (GoF Observer)."""

    @abstractmethod
    def on_event(self, event: KnowledgeEvent) -> None:
        """Handle an emitted :class:`KnowledgeEvent` (e.g. logging, telemetry, WebSocket)."""
