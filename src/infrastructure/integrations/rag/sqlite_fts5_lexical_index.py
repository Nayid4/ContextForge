"""Persistent SQLite FTS5 BM25 lexical index enforcing tenant isolation (BR-10) & PUBLISHED gate (BR-04)."""

from __future__ import annotations

from contextlib import closing
import json
from pathlib import Path
import sqlite3
from typing import Sequence

from domain.documents import EditorialStateMachine, EditorialStatus
from domain.rag import ChunkVO, ILexicalIndexPort, SearchHitVO
from infrastructure.integrations.rag.heading_aware_chunker import tokenize_text


class SqliteFts5LexicalIndex(ILexicalIndexPort):
    """Disk-backed SQLite FTS5 full-text index with native bm25() ranking and zero cold-start re-indexing."""

    def __init__(self, persist_dir: str = "./data/database/chroma") -> None:
        self._persist_dir = Path(persist_dir)
        self._persist_dir.mkdir(parents=True, exist_ok=True)
        self._db_path = self._persist_dir / "lexical_fts5.sqlite3"
        self._init_db()

    def _init_db(self) -> None:
        with closing(sqlite3.connect(self._db_path)) as conn:
            with conn:
                conn.execute("PRAGMA journal_mode=WAL;")
                conn.execute(
                    """
                    CREATE TABLE IF NOT EXISTS chunks_meta (
                        chunk_id TEXT PRIMARY KEY,
                        doc_id TEXT NOT NULL,
                        project_slug TEXT NOT NULL,
                        path TEXT NOT NULL,
                        title TEXT NOT NULL,
                        module_name TEXT NOT NULL,
                        status TEXT NOT NULL,
                        headers_json TEXT NOT NULL,
                        text TEXT NOT NULL
                    )
                    """
                )
                conn.execute("CREATE INDEX IF NOT EXISTS idx_fts_meta_proj_doc ON chunks_meta (project_slug, doc_id)")
                conn.execute(
                    """
                    CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
                        chunk_id UNINDEXED,
                        project_slug UNINDEXED,
                        searchable_text,
                        tokenize='unicode61 remove_diacritics 2'
                    )
                    """
                )

    def has_document(self, doc_id: str, project_slug: str) -> bool:
        with closing(sqlite3.connect(self._db_path)) as conn:
            row = conn.execute(
                "SELECT 1 FROM chunks_meta WHERE project_slug = ? AND doc_id = ? LIMIT 1",
                (project_slug, doc_id),
            ).fetchone()
            return row is not None

    async def upsert_document_chunks(self, doc_id: str, project_slug: str, chunks: Sequence[ChunkVO]) -> int:
        await self.remove_document(doc_id, project_slug)
        with closing(sqlite3.connect(self._db_path)) as conn:
            with conn:
                for ch in chunks:
                    searchable = f"{ch.title} {' '.join(ch.headers)} {ch.text}"
                    conn.execute(
                        """
                        INSERT OR REPLACE INTO chunks_meta
                        (chunk_id, doc_id, project_slug, path, title, module_name, status, headers_json, text)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                        ),
                    )
                    conn.execute(
                        "INSERT INTO chunks_fts (chunk_id, project_slug, searchable_text) VALUES (?, ?, ?)",
                        (ch.chunk_id, ch.project_slug, searchable),
                    )
        return len(chunks)

    async def remove_document(self, doc_id: str, project_slug: str) -> None:
        with closing(sqlite3.connect(self._db_path)) as conn:
            with conn:
                old_ids = [
                    r[0]
                    for r in conn.execute(
                        "SELECT chunk_id FROM chunks_meta WHERE project_slug = ? AND doc_id = ?",
                        (project_slug, doc_id),
                    ).fetchall()
                ]
                for cid in old_ids:
                    conn.execute("DELETE FROM chunks_fts WHERE chunk_id = ?", (cid,))
                conn.execute("DELETE FROM chunks_meta WHERE project_slug = ? AND doc_id = ?", (project_slug, doc_id))

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
        unique_terms = list(dict.fromkeys(q_terms))[:16]
        fts_expr = " OR ".join(f'"{t.replace(chr(34), "")}"' for t in unique_terms if t.replace('"', ""))
        if not fts_expr:
            return []

        with closing(sqlite3.connect(self._db_path)) as conn:
            try:
                rows = conn.execute(
                    """
                    SELECT m.chunk_id, m.doc_id, m.project_slug, m.path, m.title, m.module_name,
                           m.status, m.headers_json, m.text, -bm25(chunks_fts) AS rank_score
                    FROM chunks_fts
                    JOIN chunks_meta m ON m.chunk_id = chunks_fts.chunk_id
                    WHERE chunks_fts MATCH ? AND m.project_slug = ?
                    ORDER BY bm25(chunks_fts) ASC
                    LIMIT ?
                    """,
                    (fts_expr, project_slug, max(top_k * 4, 40)),
                ).fetchall()
            except sqlite3.OperationalError:
                return []

        scored: list[SearchHitVO] = []
        for r in rows:
            st_res = EditorialStatus.parse(r[6])
            st = st_res.value if not st_res.is_error else EditorialStatus.PUBLISHED
            if not EditorialStateMachine.is_rag_eligible(st, include_drafts=include_drafts):
                continue
            if module_name and module_name != "all" and r[5] != module_name:
                continue
            raw_score = float(r[9] or 0.0)
            norm_score = round(max(0.05, raw_score if raw_score > 0 else 0.1), 4)
            scored.append(
                SearchHitVO(
                    chunk_id=r[0],
                    doc_id=r[1],
                    project_slug=r[2],
                    path=r[3],
                    title=r[4],
                    module_name=r[5],
                    headers=tuple(json.loads(r[7] or "[]")),
                    text=r[8],
                    score=norm_score,
                    source_type="lexical_fts5",
                )
            )
            if len(scored) >= top_k:
                break
        return scored
