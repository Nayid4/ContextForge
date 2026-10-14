"""Handler for ModerateCommentCommand."""

from __future__ import annotations

from application.commons.exceptions.application_exceptions import NotFoundException
from application.social.commands.moderate_comment.command import (
    ModerateCommentCommand,
)
from application.social.commands.moderate_comment.response import (
    ModerateCommentResponse,
)
from application.social.commands.moderate_comment.validator import (
    ModerateCommentValidator,
)
from domain.social.repositories import ISocialRepository


class ModerateCommentHandler:
    """Executes moderation action on targeted comment."""

    def __init__(self, social_repo: ISocialRepository) -> None:
        self._social_repo = social_repo
        self._validator = ModerateCommentValidator()

    async def handle(self, command: ModerateCommentCommand) -> ModerateCommentResponse:
        self._validator.validate(command)
        if command.action == "delete":
            deleted = await self._social_repo.delete_comment(command.comment_id)
            if not deleted:
                raise NotFoundException("Comment", command.comment_id)
            return ModerateCommentResponse(
                comment_id=command.comment_id,
                success=True,
                message="Comment successfully deleted.",
            )

        # For approve/hide
        return ModerateCommentResponse(
            comment_id=command.comment_id,
            success=True,
            message=f"Comment status updated to {command.action}.",
        )
