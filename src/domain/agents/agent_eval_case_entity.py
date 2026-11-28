"""Saved evaluation / regression test case belonging to a project AI Agent."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass(frozen=True)
class AgentEvalCaseEntity:
    case_id: str
    agent_id: str
    project_slug: str
    question: str
    expected_citation_path: str = ""
    expected_substring: str = ""
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
