"""Repository port for discussion threads, comments, and idempotent ratings with DB-level pagination."""

from __future__ import annotations

from typing import Protocol

from domain.collaboration.comment_entity import CommentEntity
from domain.collaboration.discussion_thread_entity import DiscussionThreadEntity
from domain.collaboration.rating_summary_vo import RatingSummaryVO
from domain.common import PagedResult, PageParams


class ICollaborationRepositoryPort(Protocol):
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
    ) -> DiscussionThreadEntity: ...
    async def set_thread_resolved(self, thread_id: str, resolved: bool = True) -> DiscussionThreadEntity | None: ...
    async def get_comment(self, comment_id: str) -> CommentEntity | None: ...
    async def delete_comment(self, comment_id: str) -> bool: ...
    async def list_threads(self, book_id: str, project_slug: str) -> list[DiscussionThreadEntity]: ...
    async def list_threads_paginated(
        self,
        book_id: str,
        project_slug: str,
        pagination: PageParams = PageParams(),
    ) -> PagedResult[DiscussionThreadEntity]: ...
    async def upsert_rating(self, *, book_id: str, project_slug: str, user_identifier: str, score: int) -> RatingSummaryVO: ...
    async def get_rating_summary(self, book_id: str, user_identifier: str | None = None) -> RatingSummaryVO: ...
