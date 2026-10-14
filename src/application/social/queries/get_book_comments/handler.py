"""Handler for GetBookCommentsQuery."""

from __future__ import annotations

from application.mappers.social_mapper import SocialMapper
from application.social.queries.get_book_comments.query import (
    GetBookCommentsQuery,
)
from application.social.queries.get_book_comments.response import (
    GetBookCommentsResponse,
)
from application.social.queries.get_book_comments.validator import (
    GetBookCommentsValidator,
)
from domain.social.repositories import ISocialRepository


class GetBookCommentsHandler:
    """Retrieves all comments associated with target document."""

    def __init__(self, social_repo: ISocialRepository) -> None:
        self._social_repo = social_repo
        self._validator = GetBookCommentsValidator()

    async def handle(self, query: GetBookCommentsQuery) -> GetBookCommentsResponse:
        self._validator.validate(query)
        comments = await self._social_repo.get_comments_for_target(query.target_id)
        dtos = [SocialMapper.comment_to_dto(c) for c in comments]
        return GetBookCommentsResponse(
            target_id=query.target_id,
            comments=dtos,
            count=len(dtos),
        )
