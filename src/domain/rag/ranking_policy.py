"""Score fusion ranking policy enum (RRF vs Weighted)."""

from __future__ import annotations

from enum import Enum


class RankingPolicy(str, Enum):
    RRF = "rrf"
    WEIGHTED = "weighted"
