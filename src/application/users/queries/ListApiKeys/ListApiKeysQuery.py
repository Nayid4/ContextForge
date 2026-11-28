from __future__ import annotations
from dataclasses import dataclass
from application.common import IQuery

@dataclass(frozen=True)
class ListApiKeysQuery(IQuery[list[dict[str, object]]]):
    user_id: str | None = None
