from __future__ import annotations
from dataclasses import dataclass
from application.common import IQuery
from domain.rag import ChatMessageEntity

@dataclass(frozen=True)
class GetChatSessionHistoryQuery(IQuery[list[ChatMessageEntity]]):
    session_id: str
    project_slug: str = "default"
