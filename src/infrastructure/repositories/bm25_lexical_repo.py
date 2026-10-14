"""BM25 Lexical Search Repository with Multi-Project Partitioning."""

from __future__ import annotations

import re
from rank_bm25 import BM25Plus
from domain.knowledge_docs.entities import DocumentChunk
from domain.rag_engine.entities import RetrievalResult
from domain.rag_engine.repositories import ILexicalIndexRepository


class BM25LexicalRepository(ILexicalIndexRepository):
    """In-memory BM25Plus index partitioned strictly by project_slug."""

    def __init__(self) -> None:
        self._project_chunks: dict[str, list[DocumentChunk]] = {}
        self._project_indexes: dict[str, BM25Plus] = {}

    async def index_chunks(self, chunks: list[DocumentChunk], project_slug: str = "default") -> None:
        if not chunks:
            return

        target_slug = chunks[0].project_slug if chunks[0].project_slug else project_slug
        self._project_chunks[target_slug] = list(chunks)
        corpus = [
            self._tokenize(f"{' '.join(c.header_hierarchy)} {' '.join(c.tags)} {c.text}")
            for c in chunks
        ]

        if corpus:
            self._project_indexes[target_slug] = BM25Plus(corpus)
        else:
            self._project_indexes.pop(target_slug, None)

    async def search(
        self,
        query: str,
        project_slug: str = "default",
        top_k: int = 5,
    ) -> list[RetrievalResult]:
        index = self._project_indexes.get(project_slug)
        chunks = self._project_chunks.get(project_slug, [])

        if not index or not chunks:
            return []

        tokens = self._tokenize(query)
        if not tokens:
            return []

        scores = index.get_scores(tokens)
        scored_pairs = sorted(
            enumerate(scores),
            key=lambda pair: pair[1],
            reverse=True,
        )

        results: list[RetrievalResult] = []
        for idx, score in scored_pairs[:top_k]:
            if score <= 0:
                continue
            chunk = chunks[idx]
            results.append(
                RetrievalResult(
                    chunk_id=f"{chunk.document_path}_{idx}",
                    text=chunk.text,
                    file_path=chunk.document_path,
                    relevance_score=round(float(score), 4),
                    source_type="lexical",
                    header_hierarchy=chunk.header_hierarchy,
                )
            )

        return results

    async def clear_project(self, project_slug: str) -> None:
        """Clear indexed chunks and BM25 index for specific project."""
        self._project_chunks.pop(project_slug, None)
        self._project_indexes.pop(project_slug, None)

    @staticmethod
    def _tokenize(text: str) -> list[str]:
        return [t.lower() for t in re.findall(r"\b\w+\b", text)]


# Alias for compatibility with spec
BM25IndexService = BM25LexicalRepository
