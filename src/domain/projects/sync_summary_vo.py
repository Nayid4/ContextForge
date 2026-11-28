"""Result value object of incremental SHA-256 Docs-as-Code synchronization with conflict tracking (RF-PRJ-004, BR-20)."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SyncSummaryVO:
    project_slug: str
    added_count: int
    updated_count: int
    unchanged_count: int
    archived_count: int
    duration_ms: float
    conflicted_count: int = 0
    conflicted_paths: tuple[str, ...] = ()
    deleted_on_disk_paths: tuple[str, ...] = ()
