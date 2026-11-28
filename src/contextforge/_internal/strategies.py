"""Built-in GoF Strategy implementations for Chunking and Hybrid Ranking."""

from __future__ import annotations

import re
from typing import Sequence

from contextforge._internal.stores import estimate_tokens
from contextforge.contracts import IChunkingStrategy, IHybridRankingStrategy
from contextforge.models import DocumentChunk, KnowledgeDocument, SearchHit

_HEADING_RE = re.compile(r"^(#{1,6})\s+(.+)$")


class HeadingAwareChunkingStrategy(IChunkingStrategy):
    """Splits Markdown documents along heading boundaries while respecting max char length."""

    def __init__(self, max_chars: int = 800) -> None:
        self._max_chars = max(120, max_chars)

    @property
    def name(self) -> str:
        return "heading_aware"

    def chunk(self, document: KnowledgeDocument) -> list[DocumentChunk]:
        sections: list[tuple[tuple[str, ...], str]] = []
        current_headers: list[str] = [document.title]
        buffer: list[str] = []

        for line in document.content.splitlines():
            match = _HEADING_RE.match(line.strip())
            if match:
                if buffer:
                    sections.append((tuple(current_headers), "\n".join(buffer).strip()))
                    buffer = []
                level = len(match.group(1))
                heading_text = match.group(2).strip()
                current_headers = current_headers[: max(1, level - 1)] + [heading_text]
            else:
                buffer.append(line)

        if buffer:
            sections.append((tuple(current_headers), "\n".join(buffer).strip()))

        chunks: list[DocumentChunk] = []
        idx = 0
        for headers, text in sections:
            if not text:
                continue
            for start in range(0, len(text), self._max_chars):
                segment = text[start : start + self._max_chars].strip()
                if not segment:
                    continue
                chunks.append(
                    DocumentChunk(
                        chunk_id=f"{document.doc_id}#c{idx}",
                        doc_id=document.doc_id,
                        title=document.title,
                        text=segment,
                        collection=document.collection,
                        headers=headers,
                        tags=document.tags,
                        token_estimate=estimate_tokens(segment),
                    )
                )
                idx += 1

        if not chunks and document.content.strip():
            body = document.content.strip()
            chunks.append(
                DocumentChunk(
                    chunk_id=f"{document.doc_id}#c0",
                    doc_id=document.doc_id,
                    title=document.title,
                    text=body,
                    collection=document.collection,
                    headers=(document.title,),
                    tags=document.tags,
                    token_estimate=estimate_tokens(body),
                )
            )
        return chunks


class SlidingWindowChunkingStrategy(IChunkingStrategy):
    """Splits text into overlapping fixed-size character windows."""

    def __init__(self, window_chars: int = 600, overlap_chars: int = 100) -> None:
        self._window = max(100, window_chars)
        self._overlap = max(0, min(overlap_chars, self._window // 2))

    @property
    def name(self) -> str:
        return "sliding_window"

    def chunk(self, document: KnowledgeDocument) -> list[DocumentChunk]:
        text = document.content.strip()
        if not text:
            return []
        step = max(1, self._window - self._overlap)
        chunks: list[DocumentChunk] = []
        for idx, start in enumerate(range(0, len(text), step)):
            segment = text[start : start + self._window].strip()
            if not segment:
                continue
            chunks.append(
                DocumentChunk(
                    chunk_id=f"{document.doc_id}#w{idx}",
                    doc_id=document.doc_id,
                    title=document.title,
                    text=segment,
                    collection=document.collection,
                    headers=(document.title,),
                    tags=document.tags,
                    token_estimate=estimate_tokens(segment),
                )
            )
            if start + self._window >= len(text):
                break
        return chunks


class ReciprocalRankFusionStrategy(IHybridRankingStrategy):
    """Reciprocal Rank Fusion (RRF) combining lexical and vector rankings."""

    def __init__(self, k: int = 60) -> None:
        self._k = max(1, k)

    @property
    def name(self) -> str:
        return "rrf"

    def fuse(
        self,
        lexical_hits: Sequence[SearchHit],
        vector_hits: Sequence[SearchHit],
        top_k: int,
    ) -> list[SearchHit]:
        scores: dict[str, float] = {}
        best_hit: dict[str, SearchHit] = {}
        sources: dict[str, set[str]] = {}

        for rank, hit in enumerate(lexical_hits, start=1):
            scores[hit.chunk_id] = scores.get(hit.chunk_id, 0.0) + 1.0 / (self._k + rank)
            best_hit.setdefault(hit.chunk_id, hit)
            sources.setdefault(hit.chunk_id, set()).add("lexical")

        for rank, hit in enumerate(vector_hits, start=1):
            scores[hit.chunk_id] = scores.get(hit.chunk_id, 0.0) + 1.0 / (self._k + rank)
            best_hit.setdefault(hit.chunk_id, hit)
            sources.setdefault(hit.chunk_id, set()).add("vector")

        ranked_ids = sorted(scores.keys(), key=lambda cid: scores[cid], reverse=True)[: max(1, top_k)]
        return [
            SearchHit(
                chunk_id=best_hit[cid].chunk_id,
                doc_id=best_hit[cid].doc_id,
                title=best_hit[cid].title,
                text=best_hit[cid].text,
                score=round(scores[cid], 6),
                source_type="hybrid" if len(sources[cid]) > 1 else next(iter(sources[cid])),
                collection=best_hit[cid].collection,
                headers=best_hit[cid].headers,
            )
            for cid in ranked_ids
        ]


class WeightedLinearRankingStrategy(IHybridRankingStrategy):
    """Normalized weighted linear combination of lexical and vector scores."""

    def __init__(self, lexical_weight: float = 0.55, vector_weight: float = 0.45) -> None:
        total = max(1e-9, lexical_weight + vector_weight)
        self._lw = lexical_weight / total
        self._vw = vector_weight / total

    @property
    def name(self) -> str:
        return "weighted"

    def fuse(
        self,
        lexical_hits: Sequence[SearchHit],
        vector_hits: Sequence[SearchHit],
        top_k: int,
    ) -> list[SearchHit]:
        max_lex = max((h.score for h in lexical_hits), default=1.0) or 1.0
        max_vec = max((h.score for h in vector_hits), default=1.0) or 1.0
        scores: dict[str, float] = {}
        best_hit: dict[str, SearchHit] = {}
        sources: dict[str, set[str]] = {}

        for hit in lexical_hits:
            scores[hit.chunk_id] = scores.get(hit.chunk_id, 0.0) + self._lw * (hit.score / max_lex)
            best_hit.setdefault(hit.chunk_id, hit)
            sources.setdefault(hit.chunk_id, set()).add("lexical")

        for hit in vector_hits:
            scores[hit.chunk_id] = scores.get(hit.chunk_id, 0.0) + self._vw * (hit.score / max_vec)
            best_hit.setdefault(hit.chunk_id, hit)
            sources.setdefault(hit.chunk_id, set()).add("vector")

        ranked_ids = sorted(scores.keys(), key=lambda cid: scores[cid], reverse=True)[: max(1, top_k)]
        return [
            SearchHit(
                chunk_id=best_hit[cid].chunk_id,
                doc_id=best_hit[cid].doc_id,
                title=best_hit[cid].title,
                text=best_hit[cid].text,
                score=round(scores[cid], 6),
                source_type="hybrid" if len(sources[cid]) > 1 else next(iter(sources[cid])),
                collection=best_hit[cid].collection,
                headers=best_hit[cid].headers,
            )
            for cid in ranked_ids
        ]
