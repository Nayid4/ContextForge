"""Validator for SaveRawMarkdownCommand."""

from __future__ import annotations

from application.book_registry.commands.save_raw_markdown.command import (
    SaveRawMarkdownCommand,
)
from application.commons.exceptions.application_exceptions import ValidationException


class SaveRawMarkdownValidator:
    """Validates parameters for SaveRawMarkdownCommand."""

    def validate(self, command: SaveRawMarkdownCommand) -> None:
        if not command.library_id or not command.library_id.strip():
            raise ValidationException("Library ID cannot be empty.")
        if not command.doc_name or not command.doc_name.strip():
            raise ValidationException("Document name cannot be empty.")
        if not command.raw_markdown:
            raise ValidationException("Markdown content cannot be empty.")

