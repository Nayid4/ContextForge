"""Validator for ExportAgentRulesCommand."""

from __future__ import annotations

from application.commons.exceptions import ValidationException
from application.context_bridge.commands.export_agent_rules.command import ExportAgentRulesCommand


class ExportAgentRulesValidator:
    """Validates ExportAgentRulesCommand."""

    VALID_TARGETS = {"claude_md", "cursorrules", "agents_md", "markdown"}

    @staticmethod
    def validate(command: ExportAgentRulesCommand) -> None:
        if not command.project_slug or not command.project_slug.strip():
            raise ValidationException("El slug del proyecto es obligatorio.")
        if command.agent_target not in ExportAgentRulesValidator.VALID_TARGETS:
            raise ValidationException(f"Destino inválido: {command.agent_target}.")

