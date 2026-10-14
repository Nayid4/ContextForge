"""Validator for SendScopedMessageCommand."""

from __future__ import annotations

from application.chat.commands.send_scoped_message.command import (
    SendScopedMessageCommand,
)
from application.commons.exceptions.application_exceptions import ValidationException


class SendScopedMessageValidator:
    """Validates parameters for SendScopedMessageCommand."""

    def validate(self, command: SendScopedMessageCommand) -> None:
        if not command.session_id or not command.session_id.strip():
            raise ValidationException("Session ID cannot be empty.")
        if not command.book_id or not command.book_id.strip():
            raise ValidationException("Book ID cannot be empty.")
        if not command.user_message or not command.user_message.strip():
            raise ValidationException("User message cannot be empty.")
