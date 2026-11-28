"""Abstract Factory selecting SQLAlchemy or NoSQL UnitOfWork."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from domain.ports import IUnitOfWork
from infrastructure.persistence.noop_unit_of_work import NoOpDocumentUnitOfWork
from infrastructure.persistence.unit_of_work import SqlAlchemyUnitOfWork


class UnitOfWorkFactory:
    def __init__(self, db_provider: str, session_maker: async_sessionmaker[AsyncSession]) -> None:
        self._provider = db_provider.lower()
        self._session_maker = session_maker

    def create(self) -> IUnitOfWork:
        if self._provider in ("mongodb", "firebase"):
            return NoOpDocumentUnitOfWork()
        return SqlAlchemyUnitOfWork(self._session_maker)
