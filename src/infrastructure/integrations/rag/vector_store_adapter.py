"""Hybrid Dense Semantic + Sovereign 4-Gram Cosine Vector Store with SQLite persistence (BR-04, BR-10)."""

from __future__ import annotations

from collections import Counter
from contextlib import closing
import json
import math
from pathlib import Path
import re
import sqlite3
from typing import Sequence

from domain.documents import EditorialStateMachine, EditorialStatus
from domain.rag import ChunkVO, IEmbeddingProviderPort, IVectorStorePort, SearchHitVO
from infrastructure.integrations.rag.heading_aware_chunker import tokenize_text


class SovereignVectorStoreAdapter(IVectorStorePort):
    """Computes real dense semantic embeddings when an IEmbeddingProviderPort is available, with automatic air-gapped 4-gram fallback and SQLite persistence."""

    def __init__(
        self,
        persist_dir: str = "./data/database/chroma",
        embedding_provider: IEmbeddingProviderPort | None = None,
    ) -> None:
        self._persist_dir = Path(persist_dir)
        self._persist_dir.mkdir(parents=True, exist_ok=True)
        self._db_path = self._persist_dir / "vector_store.sqlite3"
        self._embedding_provider = embedding_provider
        self._by_project: dict[str, dict[str, tuple[ChunkVO, dict[str, float], list[float] | None, str, int]]] = {}
        self._init_sqlite()
        self._hydrate_from_sqlite()

    def set_embedding_provider(self, provider: IEmbeddingProviderPort | None) -> None:
        self._embedding_provider = provider

    def get_reindex_status(self, configured_embedding_model: str) -> dict[str, object]:
        """Inspects stored vector chunks to report whether an embedding model change requires reindexing."""
        target = (configured_embedding_model or "").strip()
        stored_models: set[str] = set()
        chunks_total = 0
        chunks_outdated = 0
        for bucket in self._by_project.values():
            for _, _, dense, emb_model, _ in bucket.values():
                chunks_total += 1
                if emb_model:
                    stored_models.add(emb_model)
                model_tail = emb_model.split(":")[-1] if emb_model else ""
                if dense is not None and target and model_tail and model_tail != target:
                    chunks_outdated += 1
        needs_reindex = chunks_outdated > 0
        warning = (
            f"Hay {chunks_outdated} fragmentos indexados con un modelo de embeddings distinto a '{target}'. Reindexa para restaurar búsqueda densa homogénea."
            if needs_reindex
            else ""
        )
        return {
            "active_embedding_model": target,
            "stored_models": sorted(stored_models),
            "chunks_total": chunks_total,
            "chunks_outdated": chunks_outdated,
            "needs_reindex": needs_reindex,
            "warning_message": warning,
        }

    def _active_model_signature(self) -> str:
        if self._embedding_provider is None:
            return ""
        return f"{self._embedding_provider.provider_name}:{self._embedding_provider.model_name}"

    def _init_sqlite(self) -> None:
        with closing(sqlite3.connect(self._db_path)) as conn:
            with conn:
                conn.execute(
                    """
                    CREATE TABLE IF NOT EXISTS vector_chunks (
                        chunk_id TEXT PRIMARY KEY,
                        doc_id TEXT NOT NULL,
                        project_slug TEXT NOT NULL,
                        path TEXT NOT NULL,
                        title TEXT NOT NULL,
                        module_name TEXT NOT NULL,
                        status TEXT NOT NULL,
                        headers_json TEXT NOT NULL,
                        text TEXT NOT NULL,
                        dense_vec_json TEXT NULL,
                        embedding_model TEXT NOT NULL DEFAULT '',
                        embedding_dim INTEGER NOT NULL DEFAULT 0
                    )
                    """
                )
                cols = {row[1] for row in conn.execute("PRAGMA table_info(vector_chunks)").fetchall()}
                if "embedding_model" not in cols:
                    conn.execute("ALTER TABLE vector_chunks ADD COLUMN embedding_model TEXT NOT NULL DEFAULT ''")
                if "embedding_dim" not in cols:
                    conn.execute("ALTER TABLE vector_chunks ADD COLUMN embedding_dim INTEGER NOT NULL DEFAULT 0")
                conn.execute("CREATE INDEX IF NOT EXISTS idx_vec_proj_doc ON vector_chunks (project_slug, doc_id)")

    def _hydrate_from_sqlite(self) -> None:
        with closing(sqlite3.connect(self._db_path)) as conn:
            rows = conn.execute(
                "SELECT chunk_id, doc_id, project_slug, path, title, module_name, status, headers_json, text, dense_vec_json, embedding_model, embedding_dim FROM vector_chunks"
            ).fetchall()
        for r in rows:
            ch = ChunkVO(
                chunk_id=r[0],
                doc_id=r[1],
                project_slug=r[2],
                path=r[3],
                title=r[4],
                module_name=r[5],
                status=r[6],
                headers=tuple(json.loads(r[7] or "[]")),
                text=r[8],
            )
            dense = json.loads(r[9]) if r[9] else None
            emb_model = str(r[10] or "")
            emb_dim = int(r[11] or (len(dense) if dense else 0))
            sparse = self._embed_sparse(f"{ch.title} {' '.join(ch.headers)} {ch.text}")
            self._by_project.setdefault(ch.project_slug, {})[ch.chunk_id] = (ch, sparse, dense, emb_model, emb_dim)

    @staticmethod
    def _embed_sparse(text: str) -> dict[str, float]:
        cleaned = text.lower()
        vec: Counter[str] = Counter(tokenize_text(cleaned))
        compact = re.sub(r"\s+", " ", cleaned)
        for idx in range(max(0, len(compact) - 3)):
            gram = compact[idx : idx + 4]
            if gram.strip():
                vec[f"g:{gram}"] += 0.35
        norm = math.sqrt(sum(v * v for v in vec.values())) or 1.0
        return {k: v / norm for k, v in vec.items()}

    def has_document(self, doc_id: str, project_slug: str) -> bool:
        bucket = self._by_project.get(project_slug, {})
        return any(item[0].doc_id == doc_id for item in bucket.values())

    async def upsert_document_chunks(self, doc_id: str, project_slug: str, chunks: Sequence[ChunkVO]) -> int:
        await self.remove_document(doc_id, project_slug)
        bucket = self._by_project.setdefault(project_slug, {})
        texts = [f"{ch.title} {' '.join(ch.headers)} {ch.text}" for ch in chunks]
        dense_vecs: list[list[float] | None] = [None] * len(chunks)
        emb_model = ""
        if self._embedding_provider is not None and texts:
            try:
                computed = await self._embedding_provider.embed_texts(texts)
                if len(computed) == len(chunks):
                    dense_vecs = [v for v in computed]
                    emb_model = self._active_model_signature()
            except Exception:
                dense_vecs = [None] * len(chunks)
                emb_model = ""

        with closing(sqlite3.connect(self._db_path)) as conn:
            with conn:
                for ch, text_blob, dense in zip(chunks, texts, dense_vecs):
                    sparse = self._embed_sparse(text_blob)
                    dim = len(dense) if dense is not None else 0
                    stored_model = emb_model if dense is not None else ""
                    bucket[ch.chunk_id] = (ch, sparse, dense, stored_model, dim)
                    conn.execute(
                        """
                        INSERT OR REPLACE INTO vector_chunks
                        (chunk_id, doc_id, project_slug, path, title, module_name, status, headers_json, text, dense_vec_json, embedding_model, embedding_dim)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            ch.chunk_id,
                            ch.doc_id,
                            ch.project_slug,
                            ch.path,
                            ch.title,
                            ch.module_name,
                            ch.status,
                            json.dumps(list(ch.headers), ensure_ascii=False),
                            ch.text,
                            json.dumps(dense) if dense is not None else None,
                            stored_model,
                            dim,
                        ),
                    )
        return len(chunks)

    async def remove_document(self, doc_id: str, project_slug: str) -> None:
        bucket = self._by_project.get(project_slug, {})
        for cid in [k for k, item in bucket.items() if item[0].doc_id == doc_id]:
            del bucket[cid]
        with closing(sqlite3.connect(self._db_path)) as conn:
            with conn:
                conn.execute("DELETE FROM vector_chunks WHERE project_slug = ? AND doc_id = ?", (project_slug, doc_id))

    async def search(
        self,
        query: str,
        *,
        project_slug: str,
        top_k: int = 10,
        module_name: str | None = None,
        include_drafts: bool = False,
    ) -> list[SearchHitVO]:
        q_sparse = self._embed_sparse(query)
        q_dense: list[float] | None = None
        active_sig = self._active_model_signature()
        if self._embedding_provider is not None and query.strip():
            try:
                res = await self._embedding_provider.embed_texts([query])
                if res:
                    q_dense = res[0]
            except Exception:
                q_dense = None

        if not q_sparse and not q_dense:
            return []

        hits: list[SearchHitVO] = []
        for ch, d_sparse, d_dense, d_model, d_dim in self._by_project.get(project_slug, {}).values():
            if not EditorialStateMachine.is_rag_eligible(EditorialStatus.parse(ch.status).value, include_drafts=include_drafts):
                continue
            if module_name and module_name != "all" and ch.module_name != module_name:
                continue

            if (
                q_dense is not None
                and d_dense is not None
                and d_model == active_sig
                and len(q_dense) == len(d_dense) == d_dim
            ):
                sim = sum(a * b for a, b in zip(q_dense, d_dense))
                src = "dense_vector"
            else:
                sim = sum(qv * d_sparse.get(k, 0.0) for k, qv in q_sparse.items())
                src = "vector"

            if sim > 0.02:
                hits.append(
                    SearchHitVO(
                        chunk_id=ch.chunk_id,
                        doc_id=ch.doc_id,
                        project_slug=ch.project_slug,
                        path=ch.path,
                        title=ch.title,
                        module_name=ch.module_name,
                        headers=ch.headers,
                        text=ch.text,
                        score=round(sim, 4),
                        source_type=src,
                    )
                )
        hits.sort(key=lambda h: (-h.score, h.chunk_id))
        return hits[:top_k]
