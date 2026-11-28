"""Unified diff comparison value object between two document snapshots."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class DiffComparisonVO:
    book_id: str
    from_version: int
    to_version: int
    unified_diff: str
    added_lines: int
    removed_lines: int
