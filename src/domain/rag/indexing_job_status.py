"""Asynchronous incremental indexing job status enum."""

from __future__ import annotations

from enum import Enum


class IndexingJobStatus(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    DEAD_LETTER = "DEAD_LETTER"
