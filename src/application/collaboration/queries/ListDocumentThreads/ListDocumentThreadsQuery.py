from __future__ import annotations
from dataclasses import dataclass
from application.common import IQuery
from domain.collaboration import DiscussionThreadEntity

@dataclass(frozen=True)
class ListDocumentThreadsQuery(IQuery[list[DiscussionThreadEntity]]):
    doc_path: str
    project_slug: str = "default"
