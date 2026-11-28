from __future__ import annotations
from dataclasses import dataclass
from application.common import ICommand
from domain.documents import DocumentAggregate
from domain.rag import IndexingJobEntity

@dataclass(frozen=True)
class IndexDocumentIncrementalCommand(ICommand[IndexingJobEntity]):
    document: DocumentAggregate
    force_reindex: bool = False
