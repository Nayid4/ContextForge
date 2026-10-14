"""Handler for AddCommentCommand."""

from __future__ import annotations

import uuid
from application.commons.exceptions.application_exceptions import ValidationException
from application.mappers.social_mapper import SocialMapper
from application.social.commands.add_comment.command import AddCommentCommand
from application.social.commands.add_comment.response import AddCommentResponse
from application.social.commands.add_comment.validator import AddCommentValidator
from domain.social.entities import Comment
from domain.social.repositories import ISocialRepository


class AddCommentHandler:
    """Orchestrates adding a comment to a document."""

    def __init__(self, social_repo: ISocialRepository) -> None:
        self._social_repo = social_repo
        self._validator = AddCommentValidator()

    async def handle(self, command: AddCommentCommand) -> AddCommentResponse:
        self._validator.validate(command)
        comment = Comment(
            id=str(uuid.uuid4()),
            target_id=command.target_id,
            book_id=command.target_id,
            user_name=command.user_name,
            user_email=command.user_email,
            content=command.content,
        )
        saved = await self._social_repo.add_comment(comment)

        return AddCommentResponse(
            comment_id=saved.id,
            success=True,
            message="Comment posted successfully.",
            comment=SocialMapper.comment_to_dto(saved),
        )
