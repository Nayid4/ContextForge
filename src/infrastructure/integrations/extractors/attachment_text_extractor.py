"""Extracts indexable plaintext from PDF, DOCX, Markdown, JSON, YAML, CSV, SVG, Drawio, and TXT (RF-DOC-005)."""

from __future__ import annotations

import io
from pathlib import Path


def extract_attachment_text(file_name: str, content: bytes) -> str:
    ext = Path(file_name.lower()).suffix
    if ext in (".md", ".txt", ".json", ".yaml", ".yml", ".csv", ".drawio", ".svg"):
        return content.decode("utf-8", errors="replace")[:50_000]
    if ext == ".pdf":
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(content))
            return "\n".join(page.extract_text() or "" for page in reader.pages)[:50_000]
        except Exception:
            return ""
    if ext == ".docx":
        try:
            import docx
            d = docx.Document(io.BytesIO(content))
            return "\n".join(p.text for p in d.paragraphs if p.text.strip())[:50_000]
        except Exception:
            return ""
    return ""
