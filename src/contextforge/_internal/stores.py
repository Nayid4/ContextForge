"""Pure-Python default storage implementations (BM25 lexical, cosine vector, Markdown loader)."""

from __future__ import annotations

from collections import Counter
import math
from pathlib import Path
import re
from typing import Any, Sequence

from contextforge.contracts import ILexicalStore, IVectorStore
from contextforge.models import DocumentChunk, KnowledgeDocument, SearchHit

_TOKEN_RE = re.compile(r"[a-zA-Z0-9_\u00C0-\u024F]+")


def tokenize(text: str) -> list[str]:
    """Tokenize text into normalized lowercase alphanumeric terms."""
    return [m.group(0).lower() for m in _TOKEN_RE.finditer(text)]


def estimate_tokens(text: str) -> int:
    """Estimate LLM token count using ~4 chars/token heuristic."""
    words = len(text.split())
    return max(1, int(words * 1.3)) if words else 0


class InMemoryLexicalStore(ILexicalStore):
    """Zero-dependency BM25 lexical index implementing :class:`ILexicalStore`."""

    def __init__(self, k1: float = 1.5, b: float = 0.75) -> None:
        self._k1 = k1
        self._b = b
        self._chunks: dict[str, DocumentChunk] = {}
        self._doc_tokens: dict[str, list[str]] = {}
        self._term_freqs: dict[str, Counter[str]] = {}

    def index(self, chunks: Sequence[DocumentChunk]) -> None:
        for chunk in chunks:
            tokens = tokenize(f"{chunk.title} {' '.join(chunk.headers)} {chunk.text}")
            self._chunks[chunk.chunk_id] = chunk
            self._doc_tokens[chunk.chunk_id] = tokens
            self._term_freqs[chunk.chunk_id] = Counter(tokens)

    def search(self, query: str, top_k: int) -> list[SearchHit]:
        q_terms = tokenize(query)
        if not q_terms or not self._chunks:
            return []

        n_docs = len(self._chunks)
        avg_dl = sum(len(t) for t in self._doc_tokens.values()) / max(1, n_docs)
        doc_freq: Counter[str] = Counter()
        for tf in self._term_freqs.values():
            for term in set(q_terms):
                if tf.get(term, 0) > 0:
                    doc_freq[term] += 1

        scored: list[SearchHit] = []
        for cid, chunk in self._chunks.items():
            tf = self._term_freqs[cid]
            dl = len(self._doc_tokens[cid]) or 1
            score = 0.0
            for term in q_terms:
                f = tf.get(term, 0)
                if f == 0:
                    continue
                df = doc_freq[term]
                idf = math.log((n_docs - df + 0.5) / (df + 0.5) + 1.0)
                denom = f + self._k1 * (1.0 - self._b + self._b * (dl / max(1.0, avg_dl)))
                score += idf * ((f * (self._k1 + 1.0)) / denom)
            if score > 0.0:
                scored.append(
                    SearchHit(
                        chunk_id=chunk.chunk_id,
                        doc_id=chunk.doc_id,
                        title=chunk.title,
                        text=chunk.text,
                        score=round(score, 6),
                        source_type="lexical",
                        collection=chunk.collection,
                        headers=chunk.headers,
                    )
                )

        scored.sort(key=lambda h: h.score, reverse=True)
        return scored[: max(1, top_k)]

    def clear(self) -> None:
        self._chunks.clear()
        self._doc_tokens.clear()
        self._term_freqs.clear()


class InMemoryVectorStore(IVectorStore):
    """Zero-dependency character/token n-gram cosine vector store implementing :class:`IVectorStore`."""

    def __init__(self, dims: int = 128) -> None:
        self._dims = dims
        self._chunks: dict[str, DocumentChunk] = {}
        self._vectors: dict[str, list[float]] = {}

    def _embed(self, text: str) -> list[float]:
        vec = [0.0] * self._dims
        tokens = tokenize(text)
        features: list[str] = list(tokens)
        for tok in tokens:
            if len(tok) >= 3:
                for i in range(len(tok) - 2):
                    features.append(tok[i : i + 3])
        for feat in features:
            bucket = sum(ord(ch) * (idx + 1) for idx, ch in enumerate(feat)) % self._dims
            vec[bucket] += 1.0
        norm = math.sqrt(sum(v * v for v in vec))
        return [v / norm for v in vec] if norm > 0.0 else vec

    def index(self, chunks: Sequence[DocumentChunk]) -> None:
        for chunk in chunks:
            self._chunks[chunk.chunk_id] = chunk
            self._vectors[chunk.chunk_id] = self._embed(
                f"{chunk.title} {' '.join(chunk.tags)} {chunk.text}"
            )

    def search(self, query: str, top_k: int) -> list[SearchHit]:
        if not self._chunks or not query.strip():
            return []
        q_vec = self._embed(query)
        scored: list[SearchHit] = []
        for cid, chunk in self._chunks.items():
            c_vec = self._vectors[cid]
            sim = sum(a * b for a, b in zip(q_vec, c_vec))
            if sim > 0.0:
                scored.append(
                    SearchHit(
                        chunk_id=chunk.chunk_id,
                        doc_id=chunk.doc_id,
                        title=chunk.title,
                        text=chunk.text,
                        score=round(sim, 6),
                        source_type="vector",
                        collection=chunk.collection,
                        headers=chunk.headers,
                    )
                )
        scored.sort(key=lambda h: h.score, reverse=True)
        return scored[: max(1, top_k)]

    def clear(self) -> None:
        self._chunks.clear()
        self._vectors.clear()


def parse_markdown_file(file_path: Path, root_dir: Path) -> KnowledgeDocument:
    """Parse a Markdown file with optional simple YAML frontmatter into a :class:`KnowledgeDocument`."""
    raw = file_path.read_text(encoding="utf-8", errors="replace")
    rel_id = file_path.relative_to(root_dir).as_posix()
    meta: dict[str, Any] = {}
    body = raw

    if raw.startswith("---"):
        parts = raw.split("---", 2)
        if len(parts) == 3:
            for line in parts[1].splitlines():
                if ":" in line:
                    k, v = line.split(":", 1)
                    key = k.strip().lower()
                    val = v.strip().strip('"').strip("'")
                    if val.startswith("[") and val.endswith("]"):
                        meta[key] = [x.strip().strip('"').strip("'") for x in val[1:-1].split(",") if x.strip()]
                    else:
                        meta[key] = val
            body = parts[2].strip()

    title = str(meta.get("title") or "").strip()
    if not title:
        for line in body.splitlines():
            if line.startswith("# "):
                title = line[2:].strip()
                break
    if not title:
        title = file_path.stem.replace("_", " ").replace("-", " ").title()

    raw_tags = meta.get("tags", ())
    tags = tuple(str(t) for t in raw_tags) if isinstance(raw_tags, list) else ()
    collection = str(meta.get("collection") or meta.get("module") or "general").strip() or "general"

    return KnowledgeDocument(
        doc_id=rel_id,
        title=title,
        content=body,
        collection=collection,
        tags=tags,
        metadata=meta,
    )
