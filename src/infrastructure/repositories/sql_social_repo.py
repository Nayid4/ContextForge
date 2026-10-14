"""SQL Social Repository Implementation."""

from __future__ import annotations

from typing import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from domain.social.entities import Comment, Rating
from domain.social.repositories import ISocialRepository
from infrastructure.persistence.models.comment_model import CommentORM, RatingORM


class SqlSocialRepository(ISocialRepository):
    """SQLAlchemy implementation of ISocialRepository."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _comment_to_entity(self, orm: CommentORM) -> Comment:
        return Comment(
            id=orm.id,
            target_id=orm.doc_path,
            book_id=orm.doc_path,
            user_name=orm.user_name,
            user_email=orm.user_email,
            content=orm.content,
            created_at=orm.created_at,
        )

    def _rating_to_entity(self, orm: RatingORM) -> Rating:
        return Rating(
            id=orm.id,
            target_id=orm.target_id,
            book_id=orm.target_id,
            user_name=orm.user_name,
            score=orm.score,
            created_at=orm.created_at,
        )

    async def add_comment(self, comment: Comment) -> Comment:
        orm = CommentORM(
            id=comment.id,
            doc_path=comment.target_id or comment.book_id,
            user_name=comment.user_name,
            user_email=comment.user_email,
            content=comment.content,
            created_at=comment.created_at,
        )
        self._session.add(orm)
        await self._session.commit()
        return self._comment_to_entity(orm)

    async def get_comments_for_target(self, target_id: str) -> list[Comment]:
        query = (
            select(CommentORM)
            .where(CommentORM.doc_path == target_id)
            .order_by(CommentORM.created_at.desc())
        )
        result = await self._session.execute(query)
        orms: Sequence[CommentORM] = result.scalars().all()
        return [self._comment_to_entity(orm) for orm in orms]

    async def delete_comment(self, comment_id: str) -> bool:
        query = select(CommentORM).where(CommentORM.id == comment_id)
        result = await self._session.execute(query)
        orm = result.scalar_one_or_none()
        if not orm:
            return False
        await self._session.delete(orm)
        await self._session.commit()
        return True

    async def add_rating(self, rating: Rating) -> Rating:
        orm = RatingORM(
            id=rating.id,
            target_id=rating.target_id or rating.book_id,
            user_name=rating.user_name,
            score=rating.score,
            created_at=rating.created_at,
        )
        self._session.add(orm)
        await self._session.commit()
        return self._rating_to_entity(orm)

    async def get_ratings_for_target(self, target_id: str) -> list[Rating]:
        query = (
            select(RatingORM)
            .where(RatingORM.target_id == target_id)
            .order_by(RatingORM.created_at.desc())
        )
        result = await self._session.execute(query)
        orms: Sequence[RatingORM] = result.scalars().all()
        return [self._rating_to_entity(orm) for orm in orms]
