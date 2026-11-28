"""Immutable public data transfer objects (DTOs) for ContextForge."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


@dataclass(frozen=True)
class KnowledgeDocument:
    """Represents a technical/functional document ingested into ContextForge.

    Attributes:
        doc_id: Unique stable identifier or relative path (e.g. ``"arch/adr-01.md"``).
        title: Human-readable document title.
        content: Raw Markdown or plain-text body.
        collection: Logical knowledge space (e.g. ``"engineering"``, ``"general"``).
        tags: Optional classification tags used for filtering or boosting.
        metadata: Arbitrary key-value attributes parsed from frontmatter or caller.
    """

    doc_id: str
    title: str
    content: str
    collection: str = "general"
    tags: tuple[str, ...] = ()
    metadata: dict[str, Any] = field(default_factory=dict)

    @property
    def word_count(self) -> int:
        """Return approximate word count of the document content."""
        return len(self.content.split())


@dataclass(frozen=True)
class DocumentChunk:
    """Segment produced by an :class:`IChunkingStrategy` from a document."""

    chunk_id: str
    doc_id: str
    title: str
    text: str
    collection: str = "general"
    headers: tuple[str, ...] = ()
    tags: tuple[str, ...] = ()
    token_estimate: int = 0


@dataclass(frozen=True)
class SearchHit:
    """Single ranked retrieval result returned by :meth:`ContextForge.search`."""

    chunk_id: str
    doc_id: str
    title: str
    text: str
    score: float
    source_type: str
    collection: str = "general"
    headers: tuple[str, ...] = ()


@dataclass(frozen=True)
class SourceCitation:
    """Attribution pointer linking a RAG answer back to an exact indexed fragment."""

    doc_id: str
    title: str
    chunk_id: str
    score: float
    excerpt: str
    headers: tuple[str, ...] = ()


@dataclass(frozen=True)
class RagResponse:
    """Grounded answer produced by :meth:`ContextForge.ask` for an AI agent or chat."""

    question: str
    answer: str
    citations: tuple[SourceCitation, ...]
    provider_name: str
    retrieval_mode: str
    ranking_strategy: str
    grounded: bool
    latency_ms: float = 0.0


@dataclass(frozen=True)
class ContextBundle:
    """Token-budgeted curated context package compiled for AI agents."""

    bundle_id: str
    name: str
    export_format: str
    content: str
    included_doc_ids: tuple[str, ...]
    omitted_doc_ids: tuple[str, ...]
    estimated_tokens: int
    max_tokens: int
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


@dataclass(frozen=True)
class IngestionReport:
    """Summary returned after indexing one or more knowledge documents."""

    documents_indexed: int
    chunks_created: int
    chunking_strategy: str
    doc_ids: tuple[str, ...]
    latency_ms: float = 0.0


@dataclass(frozen=True)
class KnowledgeEvent:
    """Domain event dispatched to :class:`IKnowledgeObserver` subscribers."""

    event_type: str
    payload: dict[str, Any]
    occurred_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


@dataclass(frozen=True)
class ContextForgeConfig:
    """Immutable configuration options for :class:`ContextForge`."""

    default_chunking_strategy: str = "heading_aware"
    default_ranking_strategy: str = "rrf"
    default_retrieval_mode: str = "hybrid"
    default_export_format: str = "markdown"
    max_chunk_chars: int = 800
    chunk_overlap_chars: int = 120
    max_document_chars: int = 250_000
    enable_audit_trail: bool = True
