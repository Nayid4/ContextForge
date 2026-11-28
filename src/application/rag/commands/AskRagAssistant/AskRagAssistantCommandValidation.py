from __future__ import annotations
from application.rag.commands.AskRagAssistant.AskRagAssistantCommand import AskRagAssistantCommand
from domain.common import DomainError

class AskRagAssistantCommandValidation:
    def validate(self, request: AskRagAssistantCommand) -> list[DomainError]:
        if len(request.question.strip()) < 2:
            return [DomainError.validation("empty_question", "La pregunta al asistente RAG debe tener al menos 2 caracteres.")]
        return []
