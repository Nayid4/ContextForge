"""Validator for AskProjectContextCommand."""

from __future__ import annotations

from application.chat.commands.ask_project_context.command import AskProjectContextCommand
from application.commons.exceptions import ValidationException


class AskProjectContextValidator:
    """Validates AskProjectContextCommand inputs."""

    @staticmethod
    def validate(command: AskProjectContextCommand) -> None:
        if not command.project_slug or not command.project_slug.strip():
            raise ValidationException("El identificador del proyecto (slug) es obligatorio.")
        if not command.user_query or len(command.user_query.strip()) < 2:
            raise ValidationException("La consulta debe contener al menos 2 caracteres.")

