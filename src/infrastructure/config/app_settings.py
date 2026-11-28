"""Immutable aggregate settings container combining strongly-typed Options."""

from __future__ import annotations

from dataclasses import dataclass

from infrastructure.options import AiOptions, DatabaseOptions, EnvironmentOptions, StorageOptions


@dataclass(frozen=True)
class AppSettings:
    env: EnvironmentOptions
    db: DatabaseOptions
    ai: AiOptions
    storage: StorageOptions
