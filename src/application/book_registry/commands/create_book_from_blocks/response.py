"""CreateBookFromBlocks response DTO."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class CreateBookFromBlocksResponse:
    """Response DTO for CreateBookFromBlocksCommand."""

    success: bool
    file_path: str
    raw_markdown: str
    message: str = ""

