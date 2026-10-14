"""SaveRawMarkdown response DTO."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SaveRawMarkdownResponse:
    """Response DTO for SaveRawMarkdownCommand."""

    success: bool
    file_path: str
    message: str = ""

