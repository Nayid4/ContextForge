from __future__ import annotations
from dataclasses import dataclass
from application.common import ICommand
from domain.collaboration import RatingSummaryVO

@dataclass(frozen=True)
class RateDocumentCommand(ICommand[RatingSummaryVO]):
    doc_path: str
    user_identifier: str
    score: int
    project_slug: str = "default"
