"""Immutable Append-Only Audit Event Store with SHA-256 Hash Chaining (RF-COL-004, BR-14)."""

from __future__ import annotations
from datetime import datetime, timezone
import hashlib
import uuid
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from domain.common import PagedResult, PageParams
from domain.ports import AuditLogRecord, IEventStore
from infrastructure.persistence.models import AuditLogORM

GENESIS_HASH = "0" * 64

def _compute_chain_hash(prev_hash: str, ts_iso: str, actor_id: str, op: str, res_id: str, ok: bool) -> str:
    payload = f"{prev_hash}|{ts_iso}|{actor_id}|{op}|{res_id}|{int(ok)}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()

class SqlAppendOnlyEventStore(IEventStore):
    def __init__(self, session_maker: async_sessionmaker[AsyncSession]) -> None:
        self._session_maker = session_maker

    async def append_audit(
        self,
        *,
        actor_id: str,
        role: str,
        project_slug: str,
        operation: str,
        resource_id: str,
        succeeded: bool,
        latency_ms: float,
        client_ip: str = "local",
        error_code: str | None = None,
    ) -> AuditLogRecord:
        async with self._session_maker() as session:
            last_row = (
                await session.execute(select(AuditLogORM).order_by(AuditLogORM.seq.desc()).limit(1))
            ).scalar_one_or_none()
            prev_hash = last_row.entry_hash if last_row else GENESIS_HASH
            now = datetime.now(timezone.utc).replace(microsecond=0)
            ts_iso = now.isoformat()
            entry_hash = _compute_chain_hash(prev_hash, ts_iso, actor_id, operation, resource_id, succeeded)
            log_id = str(uuid.uuid4())
            orm = AuditLogORM(
                log_id=log_id,
                actor_id=actor_id,
                role=role,
                project_slug=project_slug,
                operation=operation,
                resource_id=resource_id,
                succeeded=succeeded,
                latency_ms=latency_ms,
                prev_hash=prev_hash,
                entry_hash=entry_hash,
                client_ip=client_ip,
                error_code=error_code,
                created_at=now,
            )
            session.add(orm)
            await session.commit()
            return _to_record(orm)

    async def list_audit_logs(
        self,
        *,
        project_slug: str | None = None,
        operation: str | None = None,
        pagination: PageParams = PageParams(),
    ) -> PagedResult[AuditLogRecord]:
        norm = pagination.normalized()
        async with self._session_maker() as session:
            stmt = select(AuditLogORM)
            cnt_stmt = select(func.count()).select_from(AuditLogORM)
            if project_slug:
                stmt = stmt.where(AuditLogORM.project_slug == project_slug)
                cnt_stmt = cnt_stmt.where(AuditLogORM.project_slug == project_slug)
            if operation:
                stmt = stmt.where(AuditLogORM.operation == operation)
                cnt_stmt = cnt_stmt.where(AuditLogORM.operation == operation)
            total = int((await session.execute(cnt_stmt)).scalar_one() or 0)
            rows = (
                await session.execute(stmt.order_by(AuditLogORM.seq.desc()).offset(norm.offset).limit(norm.page_size))
            ).scalars().all()
            return PagedResult(
                items=tuple(_to_record(r) for r in rows),
                page=norm.page,
                page_size=norm.page_size,
                total_count=total,
            )

    async def verify_chain_detailed(self) -> dict[str, object]:
        async with self._session_maker() as session:
            rows = (await session.execute(select(AuditLogORM).order_by(AuditLogORM.seq.asc()))).scalars().all()
            expected_prev = GENESIS_HASH
            broken_at: int | None = None
            for r in rows:
                if r.prev_hash != expected_prev:
                    broken_at = r.seq
                    break
                ts = r.created_at
                if ts.tzinfo is None:
                    ts = ts.replace(tzinfo=timezone.utc)
                recomputed = _compute_chain_hash(
                    r.prev_hash, ts.replace(microsecond=0).isoformat(), r.actor_id, r.operation, r.resource_id, r.succeeded
                )
                if recomputed != r.entry_hash:
                    broken_at = r.seq
                    break
                expected_prev = r.entry_hash
            return {
                "chain_valid": broken_at is None,
                "total_entries": len(rows),
                "first_seq": rows[0].seq if rows else None,
                "last_seq": rows[-1].seq if rows else None,
                "last_hash": rows[-1].entry_hash if rows else GENESIS_HASH,
                "broken_at_seq": broken_at,
            }

    async def verify_chain_integrity(self) -> bool:
        report = await self.verify_chain_detailed()
        return bool(report["chain_valid"])

def _to_record(r: AuditLogORM) -> AuditLogRecord:
    return AuditLogRecord(
        log_id=r.log_id,
        actor_id=r.actor_id,
        role=r.role,
        project_slug=r.project_slug,
        operation=r.operation,
        resource_id=r.resource_id,
        succeeded=r.succeeded,
        latency_ms=r.latency_ms,
        prev_hash=r.prev_hash,
        entry_hash=r.entry_hash,
        client_ip=r.client_ip,
        error_code=r.error_code,
        created_at=r.created_at,
    )
