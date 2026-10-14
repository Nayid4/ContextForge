"""Validator for ModerateCommentCommand."""

from __future__ import annotations

from application.commons.exceptions.application_exceptions import ValidationException
from application.social.commands.moderate_comment.command import (
    ModerateCommentCommand,
)


class ModerateCommentValidator:
    """Validates parameters for ModerateCommentCommand."""

    def validate(self, command: ModerateCommentCommand) -> None:
        if not command.comment_id or not command.comment_id.strip():
            raise ValidationException("Comment ID cannot be empty.")
        if command.action not in {"delete", "approve", "hide"}:
            raise ValidationException(
                f"Invalid moderation action '{command.action}'. Allowed: delete, approve, hide."
            )
