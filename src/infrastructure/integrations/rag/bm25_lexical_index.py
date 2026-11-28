"""BM25 lexical store enforcing tenant isolation (BR-10) & PUBLISHED gate (BR-04)."""

from __future__ import annotations

from collections import Counter
import math
from typing import Sequence

from domain.documents import EditorialStateMachine, EditorialStatus
from domain.rag import ChunkVO, ILexicalIndexPort, SearchHitVO
from infrastructure.integrations.rag.heading_aware_chunker import tokenize_text


class SovereignBm25LexicalIndex(ILexicalIndexPort):
    def __init__(self, k1: float = 1.5, b: float = 0.75) -> None:
        self._k1 = k1
        self._b = b
        self._by_project: dict[str, dict[str, ChunkVO]] = {}

    def has_document(self, doc_id: str, project_slug: str) -> bool:
        bucket = self._by_project.get(project_slug, {})
        return any(ch.doc_id == doc_id for ch in bucket.values())

    async def upsert_document_chunks(self, doc_id: str, project_slug: str, chunks: Sequence[ChunkVO]) -> int:
        await self.remove_document(doc_id, project_slug)
        bucket = self._by_project.setdefault(project_slug, {})
        for ch in chunks:
            bucket[ch.chunk_id] = ch
        return len(chunks)

    async def remove_document(self, doc_id: str, project_slug: str) -> None:
        bucket = self._by_project.get(project_slug, {})
        for cid in [k for k, ch in bucket.items() if ch.doc_id == doc_id]:
            del bucket[cid]

    async def search(
        self,
        query: str,
        *,
        project_slug: str,
        top_k: int = 10,
        module_name: str | None = None,
        include_drafts: bool = False,
    ) -> list[SearchHitVO]:
        q_terms = tokenize_text(query)
        if not q_terms:
            return []
        candidates = [
            ch
            for ch in self._by_project.get(project_slug, {}).values()
            if EditorialStateMachine.is_rag_eligible(EditorialStatus.parse(ch.status).value, include_drafts=include_drafts)
            and (not module_name or module_name == "all" or ch.module_name == module_name)
        ]
        if not candidates:
            return []

        tokenized = [tokenize_text(f"{c.title} {' '.join(c.headers)} {c.text}") for c in candidates]
        n_docs = len(candidates)
        avgdl = sum(len(t) for t in tokenized) / max(1, n_docs)
        df: Counter[str] = Counter()
        for toks in tokenized:
            for term in set(toks):
                df[term] += 1

        scored: list[SearchHitVO] = []
        for ch, toks in zip(candidates, tokenized):
            tf = Counter(toks)
            dl = max(1, len(toks))
            score = 0.0
            for qt in q_terms:
                f = tf.get(qt, 0)
                if f == 0:
                    continue
                idf = math.log(1.0 + (n_docs - df[qt] + 0.5) / (df[qt] + 0.5))
                denom = f + self._k1 * (1.0 - self._b + self._b * (dl / avgdl))
                score += idf * ((f * (self._k1 + 1.0)) / denom)
            if score > 0:
                scored.append(
                    SearchHitVO(
                        chunk_id=ch.chunk_id,
                        doc_id=ch.doc_id,
                        project_slug=ch.project_slug,
                        path=ch.path,
                        title=ch.title,
                        module_name=ch.module_name,
                        headers=ch.headers,
                        text=ch.text,
                        score=round(score, 4),
                        source_type="lexical",
                    )
                )
        scored.sort(key=lambda h: (-h.score, h.chunk_id))
        return scored[:top_k]
