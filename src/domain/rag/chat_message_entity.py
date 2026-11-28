"""Single message turn inside a scoped RAG/Agent chat session with full telemetry (model, tokens, chunks, latency)."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone

from domain.rag.source_citation_vo import SourceCitationVO


@dataclass(frozen=True)
class ChatMessageEntity:
    id: str
    session_id: str
    role: str
    content: str
    citations: tuple[SourceCitationVO, ...] = ()
    latency_ms: float = 0.0
    model_name: str = ""
    tokens_used: int = 0
    retrieved_chunk_ids: tuple[str, ...] = ()
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
