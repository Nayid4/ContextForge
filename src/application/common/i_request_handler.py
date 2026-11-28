"""Asynchronous CQRS use-case handler returning ErrorOr[TResult]."""

from __future__ import annotations

from typing import Protocol, TypeVar

from domain.common import ErrorOr

TRequest = TypeVar("TRequest")
TResult = TypeVar("TResult")


class IRequestHandler(Protocol[TRequest, TResult]):
    async def handle(self, request: TRequest) -> ErrorOr[TResult]: ...
