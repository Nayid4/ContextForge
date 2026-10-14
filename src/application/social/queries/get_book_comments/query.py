"""GetBookComments query definition."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class GetBookCommentsQuery:
    """Query to list comments posted on a specific book or document."""

    target_id: str
