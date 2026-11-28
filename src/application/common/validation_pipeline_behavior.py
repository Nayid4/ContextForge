"""CQRS PipelineBehavior executing registered IValidator rules prior to handler dispatch."""

from __future__ import annotations

from typing import Any

from application.common.i_pipeline_behavior import NextStepCallable
from application.common.i_validator import IValidator
from domain.common import ErrorOr


class ValidationPipelineBehavior:
    def __init__(self, validators: dict[type[Any], IValidator[Any]]) -> None:
        self._validators = validators

    async def handle(
        self,
        request: Any,
        next_step: NextStepCallable,
        context: dict[str, Any],
    ) -> ErrorOr[Any]:
        validator = self._validators.get(type(request))
        if validator is not None:
            errors = validator.validate(request)
            if errors:
                return ErrorOr.fail(*errors)
        return await next_step()
