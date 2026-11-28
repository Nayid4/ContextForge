"""Atomic concurrent sequence generator on cf_sequences (Optimistic CAS)."""

from __future__ import annotations
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from infrastructure.persistence.models import SequenceORM

class AtomicSequenceGenerator:
    def __init__(self, session_maker: async_sessionmaker[AsyncSession]) -> None:
        self._session_maker = session_maker

    async def next_value(self, scope_key: str) -> int:
        for _ in range(5):
            async with self._session_maker() as session:
                row = (await session.execute(select(SequenceORM).where(SequenceORM.scope_key == scope_key))).scalar_one_or_none()
                if row is None:
                    session.add(SequenceORM(scope_key=scope_key, current_value=1))
                    try:
                        await session.commit()
                        return 1
                    except Exception:
                        await session.rollback()
                        continue
                old_val = row.current_value
                new_val = old_val + 1
                res = await session.execute(
                    update(SequenceORM)
                    .where(SequenceORM.scope_key == scope_key, SequenceORM.current_value == old_val)
                    .values(current_value=new_val)
                )
                if res.rowcount == 1:
                    await session.commit()
                    return new_val
        raise RuntimeError(f"Contención excesiva generando consecutivo para {scope_key}")
