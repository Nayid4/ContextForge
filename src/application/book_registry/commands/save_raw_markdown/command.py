"""SaveRawMarkdown command definition."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SaveRawMarkdownCommand:
    """Command to persist raw Markdown directly from Markdown Pro editor."""

    library_id: str
    module: str
    doc_name: str
    raw_markdown: str

