"""GetDocTemplates query definition."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class GetDocTemplatesQuery:
    """Query to retrieve standardized blueprints and documentation templates."""

    category: str | None = None

