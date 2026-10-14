"""Validator for UpdateBookStatusCommand."""

from __future__ import annotations

from application.catalog.commands.update_book_status.command import (
    UpdateBookStatusCommand,
)
from application.commons.exceptions.application_exceptions import ValidationException


class UpdateBookStatusValidator:
    """Validates parameters for book status update."""

    def validate(self, command: UpdateBookStatusCommand) -> None:
        if not command.book_id or not command.book_id.strip():
            raise ValidationException("Book ID cannot be empty.")
        valid_statuses = {"published", "draft", "archived"}
        if command.new_status not in valid_statuses:
            raise ValidationException(
                f"Invalid status '{command.new_status}'. Allowed statuses: {', '.join(valid_statuses)}"
            )

