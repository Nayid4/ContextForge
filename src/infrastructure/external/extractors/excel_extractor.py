"""Excel XLSX and CSV Data Extractor for Tabular RAG."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


def _df_to_markdown(df: Any) -> str:
    """Format DataFrame as a clean Markdown table with fallback."""
    try:
        md = df.to_markdown(index=False)
        if md:
            return str(md)
    except Exception:
        pass

    headers = [str(c) for c in df.columns]
    lines = ["| " + " | ".join(headers) + " |", "| " + " | ".join(["---"] * len(headers)) + " |"]
    for _, row in df.iterrows():
        lines.append("| " + " | ".join(str(val) for val in row.values) + " |")
    return "\n".join(lines)


class ExcelExtractor:
    """Extracts tabular data from Excel (.xlsx, .xls) and CSV files chunked into Markdown tables."""

    def extract(self, file_path: str) -> list[dict[str, str]]:
        path = Path(file_path)
        if not path.exists():
            return []

        chunks: list[dict[str, str]] = []
        ext = path.suffix.lower()

        try:
            import pandas as pd

            if ext == ".csv":
                df = pd.read_csv(str(path)).dropna(how="all")
                if not df.empty:
                    for i in range(0, len(df), 25):
                        sub = df.iloc[i : i + 25]
                        table_md = _df_to_markdown(sub)
                        chunks.append({
                            "text": f"Archivo CSV:\n\n{table_md}",
                            "location": f"Filas {i + 1}-{min(i + 25, len(df))}",
                        })
            else:
                xls = pd.ExcelFile(str(path))
                for sheet in xls.sheet_names:
                    df = pd.read_excel(xls, sheet_name=sheet).dropna(how="all")
                    if df.empty:
                        continue
                    for i in range(0, len(df), 25):
                        sub = df.iloc[i : i + 25]
                        table_md = _df_to_markdown(sub)
                        chunks.append({
                            "text": f"Hoja '{sheet}':\n\n{table_md}",
                            "location": f"Hoja: {sheet}, Filas: {i + 1}-{min(i + 25, len(df))}",
                        })
        except Exception as exc:
            logger.warning("Error extrayendo datos tabulares de '%s': %s", file_path, exc)

        return chunks
