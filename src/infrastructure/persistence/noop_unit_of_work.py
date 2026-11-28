"""No-op UnitOfWork adapter for document/NoSQL engines."""

from __future__ import annotations

from typing import Any

from domain.ports import IUnitOfWork


class NoOpDocumentUnitOfWork(IUnitOfWork):
    async def __aenter__(self) -> NoOpDocumentUnitOfWork:
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        return None

    async def commit(self) -> None:
        return None

    async def rollback(self) -> None:
        return None
