"""Knowledge gap explicit report payload."""
from __future__ import annotations
from pydantic import BaseModel, Field


class KnowledgeGapReportPayload(BaseModel):
    agent_slug: str = ""
    question: str = Field(..., min_length=2, max_length=2000)
