"""SQLAlchemy Async Repository for Scoped RAG/Agent Chat Sessions & Messages with full telemetry."""

from __future__ import annotations

import json
import uuid
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from domain.rag import ChatMessageEntity, ChatSessionEntity, IChatRepositoryPort, SourceCitationVO
from infrastructure.persistence.models import ChatMessageORM, ChatSessionORM


class SqlChatRepository(IChatRepositoryPort):
    def __init__(self, session_maker: async_sessionmaker[AsyncSession]) -> None:
        self._sm = session_maker

    async def get_or_create_session(
        self,
        session_id: str | None,
        project_slug: str,
        book_id: str | None = None,
        user_id: str | None = None,
        agent_id: str | None = None,
        agent_version: int | None = None,
    ) -> ChatSessionEntity:
        eff_id = (session_id or "").strip() or str(uuid.uuid4())
        async with self._sm() as s:
            row = (await s.execute(select(ChatSessionORM).where(ChatSessionORM.session_id == eff_id))).scalar_one_or_none()
            if row is None:
                row = ChatSessionORM(
                    session_id=eff_id,
                    project_slug=project_slug,
                    book_id=book_id,
                    user_id=user_id,
                    agent_id=agent_id,
                    agent_version=agent_version,
                )
                s.add(row)
                await s.commit()
            return ChatSessionEntity(
                session_id=row.session_id,
                project_slug=row.project_slug,
                book_id=row.book_id,
                user_id=row.user_id,
                agent_id=getattr(row, "agent_id", None),
                agent_version=getattr(row, "agent_version", None),
                created_at=row.created_at,
            )

    async def append_message(self, message: ChatMessageEntity) -> ChatMessageEntity:
        sources_payload = [
            {
                "doc_id": c.doc_id,
                "chunk_id": c.chunk_id,
                "path": c.path,
                "title": c.title,
                "headers": list(c.headers),
                "excerpt": c.excerpt,
                "score": c.score,
            }
            for c in message.citations
        ]
        async with self._sm() as s:
            s.add(
                ChatMessageORM(
                    id=message.id,
                    session_id=message.session_id,
                    role=message.role,
                    content=message.content,
                    sources_json=json.dumps(sources_payload, ensure_ascii=False),
                    latency_ms=message.latency_ms,
                    model_name=message.model_name,
                    tokens_used=message.tokens_used,
                    retrieved_chunk_ids_json=json.dumps(list(message.retrieved_chunk_ids), ensure_ascii=False),
                )
            )
            await s.commit()
            return message

    async def list_messages(self, session_id: str, project_slug: str) -> list[ChatMessageEntity]:
        async with self._sm() as s:
            sess = (
                await s.execute(
                    select(ChatSessionORM).where(
                        ChatSessionORM.session_id == session_id,
                        ChatSessionORM.project_slug == project_slug,
                    )
                )
            ).scalar_one_or_none()
            if sess is None:
                return []
            rows = (
                await s.execute(
                    select(ChatMessageORM).where(ChatMessageORM.session_id == session_id).order_by(ChatMessageORM.created_at.asc())
                )
            ).scalars().all()
            out: list[ChatMessageEntity] = []
            for r in rows:
                raw_src = json.loads(r.sources_json or "[]")
                raw_chunks = json.loads(getattr(r, "retrieved_chunk_ids_json", "[]") or "[]")
                cits = tuple(
                    SourceCitationVO(
                        doc_id=c["doc_id"],
                        chunk_id=c["chunk_id"],
                        path=c["path"],
                        title=c["title"],
                        headers=tuple(c.get("headers", [])),
                        excerpt=c.get("excerpt", ""),
                        score=float(c.get("score", 0.0)),
                    )
                    for c in raw_src
                )
                out.append(
                    ChatMessageEntity(
                        id=r.id,
                        session_id=r.session_id,
                        role=r.role,
                        content=r.content,
                        citations=cits,
                        latency_ms=r.latency_ms,
                        model_name=getattr(r, "model_name", "") or "",
                        tokens_used=int(getattr(r, "tokens_used", 0) or 0),
                        retrieved_chunk_ids=tuple(str(x) for x in raw_chunks),
                        created_at=r.created_at,
                    )
                )
            return out

    async def clear_session(self, session_id: str, project_slug: str) -> bool:
        async with self._sm() as s:
            await s.execute(delete(ChatMessageORM).where(ChatMessageORM.session_id == session_id))
            res = await s.execute(
                delete(ChatSessionORM).where(
                    ChatSessionORM.session_id == session_id,
                    ChatSessionORM.project_slug == project_slug,
                )
            )
            await s.commit()
            return bool(res.rowcount)
