"""Agent evaluation test case creation payload."""
from __future__ import annotations
from pydantic import BaseModel, Field


class AgentEvalCasePayload(BaseModel):
    question: str = Field(..., min_length=2, max_length=1000)
    expected_citation_path: str = ""
    expected_substring: str = ""
