"""Mandatory verifiable source citation attached to RAG answers (BR-08, OR-04)."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SourceCitationVO:
    doc_id: str
    chunk_id: str
    path: str
    title: str
    headers: tuple[str, ...]
    excerpt: str
    score: float
