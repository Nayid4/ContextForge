"""Validator for AddCommentCommand."""

from __future__ import annotations

from application.commons.exceptions.application_exceptions import ValidationException
from application.social.commands.add_comment.command import AddCommentCommand


class AddCommentValidator:
    """Validates parameters for AddCommentCommand."""

    def validate(self, command: AddCommentCommand) -> None:
        if not command.target_id or not command.target_id.strip():
            raise ValidationException("Target book or document ID cannot be empty.")
        if not command.user_name or not command.user_name.strip():
            raise ValidationException("Author name cannot be empty.")
        if not command.content or not command.content.strip():
            raise ValidationException("Comment content cannot be empty.")
        if len(command.content) > 2000:
            raise ValidationException("Comment content cannot exceed 2000 characters.")
