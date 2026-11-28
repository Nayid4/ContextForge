"""Dense vector store port."""

from __future__ import annotations

from typing import Protocol, Sequence

from domain.rag.chunk_vo import ChunkVO
from domain.rag.search_hit_vo import SearchHitVO


class IVectorStorePort(Protocol):
    async def upsert_document_chunks(self, doc_id: str, project_slug: str, chunks: Sequence[ChunkVO]) -> int: ...
    async def remove_document(self, doc_id: str, project_slug: str) -> None: ...
    async def search(
        self,
        query: str,
        *,
        project_slug: str,
        top_k: int = 10,
        module_name: str | None = None,
        include_drafts: bool = False,
    ) -> list[SearchHitVO]: ...
