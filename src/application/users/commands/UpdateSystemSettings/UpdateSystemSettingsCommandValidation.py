from __future__ import annotations
from application.users.commands.UpdateSystemSettings.UpdateSystemSettingsCommand import UpdateSystemSettingsCommand
from domain.common import DomainError

class UpdateSystemSettingsCommandValidation:
    def validate(self, request: UpdateSystemSettingsCommand) -> list[DomainError]:
        errs: list[DomainError] = []
        if request.temperature is not None and not (0.0 <= request.temperature <= 2.0):
            errs.append(DomainError.validation("invalid_temperature", "temperature debe estar entre 0.0 y 2.0."))
        if request.min_grounding_score is not None and not (0.0 <= request.min_grounding_score <= 1.0):
            errs.append(DomainError.validation("invalid_grounding_score", "min_grounding_score debe estar entre 0.0 y 1.0."))
        return errs
