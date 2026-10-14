"""UpdateBookStatus command definition."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class UpdateBookStatusCommand:
    """Command to change the status of a Book/Document."""

    book_id: str
    new_status: str

