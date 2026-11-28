"""Structured grounded RAG response value object (RF-RAG-003)."""

from __future__ import annotations

from dataclasses import dataclass

from domain.rag.source_citation_vo import SourceCitationVO


@dataclass(frozen=True)
class RagAnswerVO:
    question: str
    answer: str
    citations: tuple[SourceCitationVO, ...]
    provider_name: str
    model_name: str
    grounded: bool
    sovereign_mode: bool
    degraded_fallback: bool
    latency_ms: float
    session_id: str | None = None
