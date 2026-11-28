"""DiscoverCliEngines Query Handler."""

from __future__ import annotations

from typing import Any, Callable

from application.users.queries.DiscoverCliEngines.DiscoverCliEnginesQuery import DiscoverCliEnginesQuery
from domain.common import ErrorOr


class DiscoverCliEnginesQueryHandler:
    def __init__(self, discovery_fn: Callable[[], dict[str, Any]]) -> None:
        self._discovery_fn = discovery_fn

    async def handle(self, request: DiscoverCliEnginesQuery) -> ErrorOr[dict[str, Any]]:
        return ErrorOr.ok(self._discovery_fn())
