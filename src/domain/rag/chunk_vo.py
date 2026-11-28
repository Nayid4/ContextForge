"""Indexed fragment preserving Markdown heading hierarchy (RF-RAG-001)."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ChunkVO:
    chunk_id: str
    doc_id: str
    project_slug: str
    path: str
    title: str
    module_name: str
    status: str
    headers: tuple[str, ...]
    text: str
