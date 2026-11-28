"""Aggregated idempotent document utility rating value object (RF-COL-003)."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class RatingSummaryVO:
    book_id: str
    average_score: float
    total_ratings: int
    user_score: int | None = None
