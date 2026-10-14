"""Unit of Work interface definition."""

from __future__ import annotations

from typing import Protocol


class IUnitOfWork(Protocol):
    """Protocol for atomic transactions across repositories."""

    async def __aenter__(self) -> IUnitOfWork:
        ...

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: object | None,
    ) -> None:
        ...

    async def commit(self) -> None:
        ...

    async def rollback(self) -> None:
        ...

