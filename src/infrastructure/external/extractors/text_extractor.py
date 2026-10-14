"""Plain Text and Code Extractor for Scoped RAG."""

from __future__ import annotations

import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class TextExtractor:
    """Extracts raw text from text-based files (.txt, .json, .log, .sql)."""

    def extract(self, file_path: str) -> list[dict[str, str]]:
        path = Path(file_path)
        if not path.exists():
            return []

        try:
            content = path.read_text(encoding="utf-8", errors="replace").strip()
            if not content:
                return []
            return [{"text": content, "location": f"Archivo {path.name}"}]
        except Exception as exc:
            logger.warning("Error leyendo archivo de texto '%s': %s", file_path, exc)
            return []

