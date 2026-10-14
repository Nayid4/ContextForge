"""PDF Document Text Extractor for Scoped RAG."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


class PDFExtractor:
    """Extracts text from PDF documents page by page using pypdf."""

    def extract(self, file_path: str) -> list[dict[str, str]]:
        path = Path(file_path)
        if not path.exists():
            return []

        chunks: list[dict[str, str]] = []
        try:
            from pypdf import PdfReader

            reader = PdfReader(str(path))
            for idx, page in enumerate(reader.pages):
                text = (page.extract_text() or "").strip()
                if text:
                    chunks.append({
                        "text": text,
                        "location": f"Pág. {idx + 1}",
                    })
        except Exception as exc:
            logger.warning("Error extrayendo texto de PDF '%s': %s", file_path, exc)

        return chunks
