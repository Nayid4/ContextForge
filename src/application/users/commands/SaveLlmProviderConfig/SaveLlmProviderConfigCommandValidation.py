from __future__ import annotations
from application.users.commands.SaveLlmProviderConfig.SaveLlmProviderConfigCommand import SaveLlmProviderConfigCommand
from domain.common import DomainError

class SaveLlmProviderConfigCommandValidation:
    def validate(self, request: SaveLlmProviderConfigCommand) -> list[DomainError]:
        errs: list[DomainError] = []
        if not request.provider.strip():
            errs.append(DomainError.validation("empty_provider", "provider es obligatorio."))
        if not (0.0 <= request.temperature <= 2.0):
            errs.append(DomainError.validation("invalid_temperature", "temperature debe estar entre 0.0 y 2.0 (RF-CFG-002)."))
        if not (64 <= request.max_tokens <= 32768):
            errs.append(DomainError.validation("invalid_max_tokens", "max_tokens debe estar entre 64 y 32768 (RF-CFG-002)."))
        return errs
