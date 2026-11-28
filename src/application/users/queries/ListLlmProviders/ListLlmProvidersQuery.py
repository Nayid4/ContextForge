from __future__ import annotations
from dataclasses import dataclass
from application.common import IQuery

@dataclass(frozen=True)
class ListLlmProvidersQuery(IQuery[list[dict[str, object]]]):
    only_active: bool = False
