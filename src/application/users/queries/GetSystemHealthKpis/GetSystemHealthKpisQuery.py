from __future__ import annotations
from dataclasses import dataclass
from application.common import IQuery

@dataclass(frozen=True)
class GetSystemHealthKpisQuery(IQuery[dict[str, object]]):
    project_slug: str = "default"
