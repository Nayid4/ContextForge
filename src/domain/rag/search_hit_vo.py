"""Normalized retrieval hit value object (RF-RAG-002)."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SearchHitVO:
    chunk_id: str
    doc_id: str
    project_slug: str
    path: str
    title: str
    module_name: str
    headers: tuple[str, ...]
    text: str
    score: float
    source_type: str
