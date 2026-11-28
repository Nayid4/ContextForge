"""DiscoverCliEngines Query DTO."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from application.common import IQuery


@dataclass(frozen=True)
class DiscoverCliEnginesQuery(IQuery[dict[str, Any]]):
    pass
