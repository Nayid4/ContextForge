"""Deterministic fusion of BM25 lexical hits and dense vector hits (BR-07)."""

from __future__ import annotations

from typing import Sequence

from domain.rag.search_hit_vo import SearchHitVO


class HybridFusionStrategy:
    @staticmethod
    def fuse_rrf(
        lexical_hits: Sequence[SearchHitVO],
        vector_hits: Sequence[SearchHitVO],
        top_k: int,
        rrf_k: int = 60,
    ) -> list[SearchHitVO]:
        scores: dict[str, float] = {}
        catalog: dict[str, SearchHitVO] = {}
        seen_lexical: set[str] = set()
        seen_vector: set[str] = set()

        for rank, hit in enumerate(lexical_hits, start=1):
            scores[hit.chunk_id] = scores.get(hit.chunk_id, 0.0) + (1.0 / (rrf_k + rank))
            catalog[hit.chunk_id] = hit
            seen_lexical.add(hit.chunk_id)

        for rank, hit in enumerate(vector_hits, start=1):
            scores[hit.chunk_id] = scores.get(hit.chunk_id, 0.0) + (1.0 / (rrf_k + rank))
            catalog.setdefault(hit.chunk_id, hit)
            seen_vector.add(hit.chunk_id)

        max_possible = 2.0 / (rrf_k + 1)
        merged: list[SearchHitVO] = []
        for cid, raw_score in scores.items():
            base = catalog[cid]
            src = "hybrid" if (cid in seen_lexical and cid in seen_vector) else ("lexical" if cid in seen_lexical else "vector")
            norm_score = round(min(1.0, raw_score / max_possible), 4)
            merged.append(
                SearchHitVO(
                    chunk_id=base.chunk_id,
                    doc_id=base.doc_id,
                    project_slug=base.project_slug,
                    path=base.path,
                    title=base.title,
                    module_name=base.module_name,
                    headers=base.headers,
                    text=base.text,
                    score=norm_score,
                    source_type=src,
                )
            )
        merged.sort(key=lambda item: (-item.score, item.chunk_id))
        return merged[:top_k]

    @staticmethod
    def fuse_weighted(
        lexical_hits: Sequence[SearchHitVO],
        vector_hits: Sequence[SearchHitVO],
        top_k: int,
        alpha_lexical: float = 0.45,
        beta_vector: float = 0.55,
    ) -> list[SearchHitVO]:
        max_lex = max((h.score for h in lexical_hits), default=1.0) or 1.0
        max_vec = max((h.score for h in vector_hits), default=1.0) or 1.0
        lex_map = {h.chunk_id: h.score / max_lex for h in lexical_hits}
        vec_map = {h.chunk_id: h.score / max_vec for h in vector_hits}
        catalog: dict[str, SearchHitVO] = {h.chunk_id: h for h in vector_hits}
        catalog.update({h.chunk_id: h for h in lexical_hits})

        merged: list[SearchHitVO] = []
        for cid, base in catalog.items():
            ls = lex_map.get(cid, 0.0)
            vs = vec_map.get(cid, 0.0)
            combined = round(alpha_lexical * ls + beta_vector * vs, 4)
            src = "hybrid" if (cid in lex_map and cid in vec_map) else ("lexical" if cid in lex_map else "vector")
            merged.append(
                SearchHitVO(
                    chunk_id=base.chunk_id,
                    doc_id=base.doc_id,
                    project_slug=base.project_slug,
                    path=base.path,
                    title=base.title,
                    module_name=base.module_name,
                    headers=base.headers,
                    text=base.text,
                    score=combined,
                    source_type=src,
                )
            )
        merged.sort(key=lambda item: (-item.score, item.chunk_id))
        return merged[:top_k]
