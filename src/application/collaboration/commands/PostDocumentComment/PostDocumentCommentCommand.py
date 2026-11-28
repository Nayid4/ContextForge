from __future__ import annotations
from dataclasses import dataclass
from application.common import ICommand
from domain.collaboration import DiscussionThreadEntity

@dataclass(frozen=True)
class PostDocumentCommentCommand(ICommand[DiscussionThreadEntity]):
    doc_path: str
    author_name: str
    content: str
    project_slug: str = "default"
    thread_id: str | None = None
    title: str | None = None
    section_anchor: str = ""
    author_email: str = ""
    author_id: str = ""
