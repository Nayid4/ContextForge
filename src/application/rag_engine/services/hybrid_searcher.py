"""Hybrid Searcher using Reciprocal Rank Fusion (RRF) with Multi-Project Isolation."""

from __future__ import annotations

from domain.rag_engine.entities import RetrievalResult
from domain.rag_engine.repositories import ILexicalIndexRepository, IVectorRepository


class HybridSearchService:
    """Combines Dense (ChromaDB) and Lexical (BM25) results using RRF isolated by project."""

    def __init__(
        self,
        vector_repo: IVectorRepository,
        lexical_repo: ILexicalIndexRepository,
        rrf_k: int = 60,
        dense_weight: float = 0.6,
        lexical_weight: float = 0.4,
    ) -> None:
        self._vector_repo = vector_repo
        self._lexical_repo = lexical_repo
        self._rrf_k = rrf_k
        self._dense_weight = dense_weight
        self._lexical_weight = lexical_weight

    async def search(
        self,
        query: str,
        project_slug: str = "default",
        top_k: int = 5,
    ) -> list[RetrievalResult]:
        dense_results = await self._vector_repo.search(query, project_slug=project_slug, top_k=top_k * 2)
        lexical_results = await self._lexical_repo.search(query, project_slug=project_slug, top_k=top_k * 2)

        rrf_scores: dict[str, float] = {}
        chunk_map: dict[str, RetrievalResult] = {}

        # Process dense rankings
        for rank, item in enumerate(dense_results, start=1):
            chunk_map[item.chunk_id] = item
            score = self._dense_weight * (1.0 / (self._rrf_k + rank))
            rrf_scores[item.chunk_id] = rrf_scores.get(item.chunk_id, 0.0) + score

        # Process lexical rankings
        for rank, item in enumerate(lexical_results, start=1):
            if item.chunk_id not in chunk_map:
                chunk_map[item.chunk_id] = item
            score = self._lexical_weight * (1.0 / (self._rrf_k + rank))
            rrf_scores[item.chunk_id] = rrf_scores.get(item.chunk_id, 0.0) + score

        sorted_chunks = sorted(rrf_scores.items(), key=lambda kv: kv[1], reverse=True)[:top_k]

        final_results: list[RetrievalResult] = []
        for chunk_id, combined_score in sorted_chunks:
            original = chunk_map[chunk_id]
            final_results.append(
                RetrievalResult(
                    chunk_id=original.chunk_id,
                    text=original.text,
                    file_path=original.file_path,
                    relevance_score=round(combined_score, 4),
                    source_type="hybrid",
                    header_hierarchy=original.header_hierarchy,
                )
            )

        return final_results
