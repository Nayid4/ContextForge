"""Heading-aware Markdown chunker preserving H1..H3 hierarchy without emitting empty heading-only chunks (RF-RAG-001)."""

from __future__ import annotations

import re

from domain.documents import DocumentAggregate
from domain.rag import ChunkVO

TOKEN_RE = re.compile(r"[a-zA-Z0-9_áéíóúñÁÉÍÓÚÑ-]{2,}")


def tokenize_text(text: str) -> list[str]:
    return [m.group(0).lower() for m in TOKEN_RE.finditer(text)]


def _split_clean_pieces(txt: str, max_chars: int) -> list[str]:
    if len(txt) <= max_chars:
        return [txt]
    pieces: list[str] = []
    paragraphs = re.split(r"\n{2,}", txt)
    current = ""
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        if len(current) + len(para) + 2 <= max_chars:
            current = f"{current}\n\n{para}".strip() if current else para
        else:
            if current:
                pieces.append(current)
            if len(para) <= max_chars:
                current = para
            else:
                # Split oversized single block on line or word boundary
                lines = para.splitlines()
                acc = ""
                for ln in lines:
                    if len(acc) + len(ln) + 1 <= max_chars:
                        acc = f"{acc}\n{ln}".strip() if acc else ln
                    else:
                        if acc:
                            pieces.append(acc)
                        if len(ln) <= max_chars:
                            acc = ln
                        else:
                            for pos in range(0, len(ln), max_chars):
                                seg = ln[pos : pos + max_chars].strip()
                                if seg:
                                    pieces.append(seg)
                            acc = ""
                current = acc
    if current:
        pieces.append(current)
    return pieces


def chunk_document_heading_aware(doc: DocumentAggregate, max_chars: int = 1800) -> list[ChunkVO]:
    lines = doc.content_markdown.splitlines()
    h_stack: list[tuple[int, str]] = []
    buffer: list[str] = []
    chunks: list[ChunkVO] = []

    def _has_body_lines(buf: list[str]) -> bool:
        for ln in buf:
            st = ln.strip()
            if st and not st.startswith("#") and st != "---":
                return True
        return False

    def _flush() -> None:
        txt = "\n".join(buffer).strip()
        buffer.clear()
        if not txt:
            return
        hdrs = tuple(h[1] for h in h_stack)
        for piece in _split_clean_pieces(txt, max_chars):
            if piece:
                idx = len(chunks)
                chunks.append(
                    ChunkVO(
                        chunk_id=f"{doc.id}#c{idx}",
                        doc_id=doc.id,
                        project_slug=doc.project_slug,
                        path=doc.path,
                        title=doc.title,
                        module_name=doc.module_name,
                        status=doc.status.value,
                        headers=hdrs,
                        text=piece,
                    )
                )

    for line in lines:
        s = line.strip()
        if s.startswith("#"):
            hashes = len(s) - len(s.lstrip("#"))
            heading_txt = s[hashes:].strip()
            if 1 <= hashes <= 3 and heading_txt:
                # Only flush if the current buffer actually holds body content (avoid useless 1-line heading chunks)
                if _has_body_lines(buffer):
                    _flush()
                while h_stack and h_stack[-1][0] >= hashes:
                    h_stack.pop()
                h_stack.append((hashes, heading_txt))
                buffer.append(line)
                continue
        buffer.append(line)
    _flush()
    return chunks
