"""Query for discovering local CLI AI engines installed on the OS."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class DiscoverCLIEnginesQuery:
    """Query to scan the host OS PATH for supported AI CLI tools."""

    pass

