"""Relational SQLAlchemy Async Unit of Work (IUnitOfWork)."""

from __future__ import annotations
from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from domain.ports import IUnitOfWork

class SqlAlchemyUnitOfWork(IUnitOfWork):
    def __init__(self, session_maker: async_sessionmaker[AsyncSession]) -> None:
        self._session_maker = session_maker
        self.session: AsyncSession | None = None

    async def __aenter__(self) -> SqlAlchemyUnitOfWork:
        self.session = self._session_maker()
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        if self.session is None:
            return
        if exc_type is not None:
            await self.session.rollback()
        await self.session.close()

    async def commit(self) -> None:
        if self.session is not None:
            await self.session.commit()

    async def rollback(self) -> None:
        if self.session is not None:
            await self.session.rollback()
