"""GetBookDraft query definition."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class GetBookDraftQuery:
    """Query to retrieve an in-flight book editing draft."""

    draft_id: str

