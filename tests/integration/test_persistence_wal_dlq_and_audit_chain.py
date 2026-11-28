from __future__ import annotations
import pytest
from sqlalchemy import text
from application.rag.commands.IndexDocumentIncremental import (
    IndexDocumentIncrementalCommand,
    IndexDocumentIncrementalCommandHandler,
)
from domain.documents import DocumentAggregate, EditorialStatus
from domain.rag import IndexingJobStatus
from infrastructure.di import get_container


@pytest.mark.asyncio
async def test_sqlite_wal_atomic_sequences_and_tamper_evident_audit_chain() -> None:
    c = get_container()
    await c.initialize_runtime()

    async with c.engine.connect() as conn:
        mode = (await conn.execute(text("PRAGMA journal_mode;"))).scalar_one()
        assert str(mode).lower() in ("wal", "memory")

    v1 = await c.sequences.next_value("doc_seq_test")
    v2 = await c.sequences.next_value("doc_seq_test")
    assert v2 == v1 + 1

    await c.event_store.append_audit(
        actor_id="usr-admin",
        role="Admin",
        project_slug="default",
        operation="TestAudit1",
        resource_id="res-1",
        succeeded=True,
        latency_ms=12.4,
    )
    await c.event_store.append_audit(
        actor_id="usr-curator",
        role="Curator",
        project_slug="default",
        operation="TestAudit2",
        resource_id="res-2",
        succeeded=True,
        latency_ms=8.1,
    )
    assert await c.event_store.verify_chain_integrity() is True


@pytest.mark.asyncio
async def test_indexing_job_moves_to_dead_letter_queue_after_exhausting_retries() -> None:
    c = get_container()
    await c.initialize_runtime()

    class BrokenVectorStore:
        async def upsert_document_chunks(self, doc_id: str, project_slug: str, chunks: object) -> int:
            raise RuntimeError("Simulated ChromaDB outage")
        async def remove_document(self, doc_id: str, project_slug: str) -> None:
            return None

    doc, _ = DocumentAggregate.create(
        project_slug="default",
        path="ops/dlq_test.md",
        title="Prueba DLQ",
        content_markdown="# Resiliencia\nProbando cola fallida.",
        status=EditorialStatus.PUBLISHED,
    ).value
    handler = IndexDocumentIncrementalCommandHandler(
        c.lexical_index, BrokenVectorStore(), c.indexing_job_repo, c.chunker  # type: ignore[arg-type]
    )
    job_res = await handler.handle(IndexDocumentIncrementalCommand(document=doc, force_reindex=True))
    assert not job_res.is_error
    job = job_res.value
    assert job.status == IndexingJobStatus.DEAD_LETTER
    assert job.attempts == 3
