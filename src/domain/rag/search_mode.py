"""Hybrid retrieval search mode enum."""

from __future__ import annotations

from enum import Enum


class SearchMode(str, Enum):
    LEXICAL = "lexical"
    VECTOR = "vector"
    HYBRID = "hybrid"
