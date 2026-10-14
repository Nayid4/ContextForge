"""Social Domain Repository Protocols."""

from __future__ import annotations

from typing import Protocol
from domain.social.entities import Comment, Rating


class ISocialRepository(Protocol):
    """Protocol for persisting comments, threads, and ratings."""

    async def add_comment(self, comment: Comment) -> Comment:
        ...

    async def get_comments_for_target(self, target_id: str) -> list[Comment]:
        ...

    async def delete_comment(self, comment_id: str) -> bool:
        ...

    async def add_rating(self, rating: Rating) -> Rating:
        ...

    async def get_ratings_for_target(self, target_id: str) -> list[Rating]:
        ...
