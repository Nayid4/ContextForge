"""SQLAlchemy Async Repository for Discussion Threads, Comments & Idempotent Ratings with real DB pagination."""

from __future__ import annotations

import uuid
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from domain.collaboration import CommentEntity, DiscussionThreadEntity, ICollaborationRepositoryPort, RatingSummaryVO
from domain.common import PagedResult, PageParams
from infrastructure.persistence.models import DiscussionThreadORM, DocumentCommentORM, RatingORM


def _map_thread(t: DiscussionThreadORM, comments: list[DocumentCommentORM]) -> DiscussionThreadEntity:
    return DiscussionThreadEntity(
        id=t.id,
        book_id=t.book_id,
        project_slug=t.project_slug,
        title=t.title,
        section_anchor=t.section_anchor,
        resolved=t.resolved,
        comments=[
            CommentEntity(
                id=c.id,
                thread_id=c.thread_id,
                book_id=c.book_id,
                project_slug=c.project_slug,
                author_id=getattr(c, "author_id", "") or "",
                author_name=c.author_name,
                author_email=c.author_email,
                section_anchor=c.section_anchor,
                content=c.content,
                created_at=c.created_at,
            )
            for c in comments
        ],
        created_at=t.created_at,
        updated_at=t.updated_at,
    )


class SqlCollaborationRepository(ICollaborationRepositoryPort):
    def __init__(self, session_maker: async_sessionmaker[AsyncSession]) -> None:
        self._sm = session_maker

    async def create_thread_or_reply(
        self,
        *,
        book_id: str,
        project_slug: str,
        author_name: str,
        content: str,
        thread_id: str | None = None,
        title: str | None = None,
        section_anchor: str = "",
        author_email: str = "",
        author_id: str = "",
    ) -> DiscussionThreadEntity:
        async with self._sm() as s:
            t_orm: DiscussionThreadORM | None = None
            if thread_id:
                t_orm = (await s.execute(select(DiscussionThreadORM).where(DiscussionThreadORM.id == thread_id))).scalar_one_or_none()
            if t_orm is None:
                t_orm = DiscussionThreadORM(
                    id=str(uuid.uuid4()),
                    book_id=book_id,
                    project_slug=project_slug,
                    title=(title or content[:60]).strip(),
                    section_anchor=section_anchor,
                    resolved=False,
                )
                s.add(t_orm)
            s.add(
                DocumentCommentORM(
                    id=str(uuid.uuid4()),
                    thread_id=t_orm.id,
                    book_id=book_id,
                    project_slug=project_slug,
                    author_id=author_id,
                    author_name=author_name,
                    author_email=author_email,
                    section_anchor=section_anchor,
                    content=content,
                )
            )
            await s.commit()
            comments = (
                await s.execute(
                    select(DocumentCommentORM)
                    .where(DocumentCommentORM.thread_id == t_orm.id)
                    .order_by(DocumentCommentORM.created_at.asc())
                )
            ).scalars().all()
            return _map_thread(t_orm, list(comments))

    async def set_thread_resolved(self, thread_id: str, resolved: bool = True) -> DiscussionThreadEntity | None:
        async with self._sm() as s:
            t_orm = (await s.execute(select(DiscussionThreadORM).where(DiscussionThreadORM.id == thread_id))).scalar_one_or_none()
            if t_orm is None:
                return None
            t_orm.resolved = resolved
            await s.commit()
            comments = (
                await s.execute(
                    select(DocumentCommentORM)
                    .where(DocumentCommentORM.thread_id == t_orm.id)
                    .order_by(DocumentCommentORM.created_at.asc())
                )
            ).scalars().all()
            return _map_thread(t_orm, list(comments))

    async def get_comment(self, comment_id: str) -> CommentEntity | None:
        async with self._sm() as s:
            c = (await s.execute(select(DocumentCommentORM).where(DocumentCommentORM.id == comment_id))).scalar_one_or_none()
            if c is None:
                return None
            return CommentEntity(
                id=c.id,
                thread_id=c.thread_id,
                book_id=c.book_id,
                project_slug=c.project_slug,
                author_id=getattr(c, "author_id", "") or "",
                author_name=c.author_name,
                author_email=c.author_email,
                section_anchor=c.section_anchor,
                content=c.content,
                created_at=c.created_at,
            )

    async def delete_comment(self, comment_id: str) -> bool:
        async with self._sm() as s:
            res = await s.execute(delete(DocumentCommentORM).where(DocumentCommentORM.id == comment_id))
            await s.commit()
            return bool(res.rowcount)

    async def list_threads(self, book_id: str, project_slug: str) -> list[DiscussionThreadEntity]:
        paged = await self.list_threads_paginated(book_id, project_slug, PageParams(page=1, page_size=100))
        return list(paged.items)

    async def list_threads_paginated(
        self,
        book_id: str,
        project_slug: str,
        pagination: PageParams = PageParams(),
    ) -> PagedResult[DiscussionThreadEntity]:
        norm = pagination.normalized()
        async with self._sm() as s:
            stmt = select(DiscussionThreadORM).where(
                DiscussionThreadORM.book_id == book_id,
                DiscussionThreadORM.project_slug == project_slug,
            )
            cnt = select(func.count()).select_from(DiscussionThreadORM).where(
                DiscussionThreadORM.book_id == book_id,
                DiscussionThreadORM.project_slug == project_slug,
            )
            total = int((await s.execute(cnt)).scalar_one() or 0)
            threads = (
                await s.execute(stmt.order_by(DiscussionThreadORM.created_at.desc()).offset(norm.offset).limit(norm.page_size))
            ).scalars().all()
            out: list[DiscussionThreadEntity] = []
            for t in threads:
                comments = (
                    await s.execute(
                        select(DocumentCommentORM)
                        .where(DocumentCommentORM.thread_id == t.id)
                        .order_by(DocumentCommentORM.created_at.asc())
                    )
                ).scalars().all()
                out.append(_map_thread(t, list(comments)))
            return PagedResult(items=tuple(out), page=norm.page, page_size=norm.page_size, total_count=total)

    async def upsert_rating(self, *, book_id: str, project_slug: str, user_identifier: str, score: int) -> RatingSummaryVO:
        async with self._sm() as s:
            existing = (
                await s.execute(
                    select(RatingORM).where(RatingORM.book_id == book_id, RatingORM.user_identifier == user_identifier)
                )
            ).scalar_one_or_none()
            if existing is None:
                s.add(RatingORM(id=str(uuid.uuid4()), book_id=book_id, project_slug=project_slug, user_identifier=user_identifier, score=score))
            else:
                existing.score = score
            await s.commit()
        return await self.get_rating_summary(book_id, user_identifier=user_identifier)

    async def get_rating_summary(self, book_id: str, user_identifier: str | None = None) -> RatingSummaryVO:
        async with self._sm() as s:
            rows = (await s.execute(select(RatingORM).where(RatingORM.book_id == book_id))).scalars().all()
            if not rows:
                return RatingSummaryVO(book_id=book_id, average_score=0.0, total_ratings=0, user_score=None)
            avg = round(sum(r.score for r in rows) / len(rows), 2)
            u_score = next((r.score for r in rows if r.user_identifier == user_identifier), None) if user_identifier else None
            return RatingSummaryVO(book_id=book_id, average_score=avg, total_ratings=len(rows), user_score=u_score)
