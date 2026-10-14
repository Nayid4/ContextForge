"""Validator for CreateBookFromBlocksCommand."""

from __future__ import annotations

from application.book_registry.commands.create_book_from_blocks.command import (
    CreateBookFromBlocksCommand,
)
from application.commons.exceptions.application_exceptions import ValidationException


class CreateBookFromBlocksValidator:
    """Validates parameters for CreateBookFromBlocksCommand."""

    def validate(self, command: CreateBookFromBlocksCommand) -> None:
        if not command.library_id or not command.library_id.strip():
            raise ValidationException("Library ID cannot be empty.")
        if not command.title or not command.title.strip():
            raise ValidationException("Book title cannot be empty.")

