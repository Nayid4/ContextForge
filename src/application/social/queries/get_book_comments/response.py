"""GetBookComments response DTO."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class GetBookCommentsResponse:
    """Response containing list of comments for target document."""

    target_id: str
    comments: list[dict[str, Any]]
    count: int
