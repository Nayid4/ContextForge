from __future__ import annotations
from application.collaboration.commands.RateDocument.RateDocumentCommand import RateDocumentCommand
from domain.collaboration import validate_rating_score
from domain.common import DomainError

class RateDocumentCommandValidation:
    def validate(self, request: RateDocumentCommand) -> list[DomainError]:
        res = validate_rating_score(request.score)
        return list(res.errors) if res.is_error else []
