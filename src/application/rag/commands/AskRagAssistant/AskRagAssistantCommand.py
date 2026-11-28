from __future__ import annotations
from dataclasses import dataclass
from application.common import ICommand
from domain.rag import RagAnswerVO

@dataclass(frozen=True)
class AskRagAssistantCommand(ICommand[RagAnswerVO]):
    question: str
    project_slug: str = "default"
    top_k: int = 5
    mode: str = "hybrid"
    ranking: str = "rrf"
    module_name: str | None = None
    session_id: str | None = None
    book_id: str | None = None
    user_id: str | None = None
    system_prompt: str | None = None
