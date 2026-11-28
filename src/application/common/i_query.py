"""Marker base class for side-effect-free CQRS Queries."""

from __future__ import annotations

from typing import Generic, TypeVar

TResult = TypeVar("TResult")


class IQuery(Generic[TResult]):
    pass
