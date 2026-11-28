"""Marker base class for state-mutating CQRS Commands."""

from __future__ import annotations

from typing import Generic, TypeVar

TResult = TypeVar("TResult")


class ICommand(Generic[TResult]):
    pass
