"""Unit of Work interface definition for application layer."""

from __future__ import annotations

from typing import Protocol


class IUnitOfWork(Protocol):
    """Protocol for transactional atomicity in application handlers."""

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
