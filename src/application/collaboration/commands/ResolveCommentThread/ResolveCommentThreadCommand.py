from __future__ import annotations
from dataclasses import dataclass
from application.common import ICommand
from domain.collaboration import DiscussionThreadEntity

@dataclass(frozen=True)
class ResolveCommentThreadCommand(ICommand[DiscussionThreadEntity]):
    thread_id: str
    resolved: bool = True
    project_slug: str = "default"
