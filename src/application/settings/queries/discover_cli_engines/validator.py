"""Validator for DiscoverCLIEnginesQuery."""

from __future__ import annotations

from application.settings.queries.discover_cli_engines.query import DiscoverCLIEnginesQuery


class DiscoverCLIEnginesValidator:
    """Validates DiscoverCLIEnginesQuery."""

    @staticmethod
    def validate(query: DiscoverCLIEnginesQuery) -> None:
        return None

