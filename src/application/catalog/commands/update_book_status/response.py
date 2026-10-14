"""UpdateBookStatus response DTO."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class UpdateBookStatusResponse:
    """Response DTO for UpdateBookStatusCommand."""

    book_id: str
    status: str
    success: bool
    message: str = ""

