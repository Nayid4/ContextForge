"""SQL Chat Session and Messages Repository Implementation."""

from __future__ import annotations

import json
from typing import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from domain.chat.entities import ChatMessage, DocumentSourceRef, ScopedChatSession
from domain.chat.repositories import IChatSessionRepository
from infrastructure.persistence.models.chat_session_model import (
    ChatMessageORM,
    ChatSessionORM,
)


class SqlChatSessionRepository(IChatSessionRepository):
    """SQLAlchemy implementation of IChatSessionRepository."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _message_to_entity(self, orm: ChatMessageORM) -> ChatMessage:
        sources_list: list[DocumentSourceRef] = []
        try:
            raw_sources = json.loads(orm.sources_json or "[]")
            for item in raw_sources:
                if isinstance(item, dict):
                    sources_list.append(
                        DocumentSourceRef(
                            document_path=str(item.get("document_path", "")),
                            location=str(item.get("location", "")),
                            excerpt=str(item.get("excerpt", "")),
                            is_attachment=bool(item.get("is_attachment", False)),
                            attachment_name=item.get("attachment_name"),
                        )
                    )
        except Exception:
            pass

        return ChatMessage(
            id=orm.id,
            role=orm.role,
            content=orm.content,
            timestamp=orm.created_at,
            sources=sources_list,
        )

    async def get_session(self, session_id: str) -> ScopedChatSession | None:
        query_sess = select(ChatSessionORM).where(ChatSessionORM.session_id == session_id)
        res_sess = await self._session.execute(query_sess)
        sess_orm = res_sess.scalar_one_or_none()
        if not sess_orm:
            return None

        query_msgs = (
            select(ChatMessageORM)
            .where(ChatMessageORM.session_id == session_id)
            .order_by(ChatMessageORM.created_at.asc())
        )
        res_msgs = await self._session.execute(query_msgs)
        msg_orms: Sequence[ChatMessageORM] = res_msgs.scalars().all()

        messages = [self._message_to_entity(m) for m in msg_orms]
        return ScopedChatSession(
            session_id=sess_orm.session_id,
            book_id=sess_orm.book_id,
            library_id=sess_orm.library_id,
            messages=messages,
        )

    async def save_session(self, session: ScopedChatSession) -> ScopedChatSession:
        query_sess = select(ChatSessionORM).where(ChatSessionORM.session_id == session.session_id)
        res_sess = await self._session.execute(query_sess)
        sess_orm = res_sess.scalar_one_or_none()
        if not sess_orm:
            sess_orm = ChatSessionORM(
                session_id=session.session_id,
                book_id=session.book_id,
                library_id=session.library_id,
            )
            self._session.add(sess_orm)
            await self._session.commit()

        for msg in session.messages:
            await self.append_message(session.session_id, msg)

        return session

    async def append_message(self, session_id: str, message: ChatMessage) -> ChatMessage:
        query_msg = select(ChatMessageORM).where(ChatMessageORM.id == message.id)
        res_msg = await self._session.execute(query_msg)
        orm = res_msg.scalar_one_or_none()
        if not orm:
            sources_json = json.dumps([s.to_dict() for s in message.sources])
            orm = ChatMessageORM(
                id=message.id,
                session_id=session_id,
                role=message.role,
                content=message.content,
                sources_json=sources_json,
                created_at=message.timestamp,
            )
            self._session.add(orm)
            await self._session.commit()
        return message

    async def list_sessions_for_book(self, book_id: str) -> list[ScopedChatSession]:
        query = (
            select(ChatSessionORM)
            .where(ChatSessionORM.book_id == book_id)
            .order_by(ChatSessionORM.created_at.desc())
        )
        result = await self._session.execute(query)
        orms: Sequence[ChatSessionORM] = result.scalars().all()
        sessions: list[ScopedChatSession] = []
        for orm in orms:
            sess = await self.get_session(orm.session_id)
            if sess:
                sessions.append(sess)
        return sessions
