"""Multiformat Extractors for Document Attachments."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from infrastructure.external.extractors.docx_extractor import DocxExtractor
from infrastructure.external.extractors.excel_extractor import ExcelExtractor
from infrastructure.external.extractors.pdf_extractor import PDFExtractor
from infrastructure.external.extractors.text_extractor import TextExtractor

__all__ = [
    "DocxExtractor",
    "ExcelExtractor",
    "MultiFormatExtractor",
    "PDFExtractor",
    "TextExtractor",
]


class MultiFormatExtractor:
    """Unified extractor that dispatches to format-specific extractors based on file extension."""

    def __init__(self) -> None:
        self.pdf_extractor = PDFExtractor()
        self.docx_extractor = DocxExtractor()
        self.excel_extractor = ExcelExtractor()
        self.text_extractor = TextExtractor()

    def extract(self, file_path: str) -> list[dict[str, str]]:
        path = Path(file_path)
        ext = path.suffix.lower()

        if ext == ".pdf":
            return self.pdf_extractor.extract(file_path)
        elif ext in (".docx", ".doc"):
            return self.docx_extractor.extract(file_path)
        elif ext in (".xlsx", ".xls", ".csv"):
            return self.excel_extractor.extract(file_path)
        elif ext in (".txt", ".json", ".sql", ".log", ".yaml", ".yml", ".md"):
            return self.text_extractor.extract(file_path)

        return []

