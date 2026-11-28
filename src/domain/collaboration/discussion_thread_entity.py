"""Discussion thread grouping peer-review comments with resolved status (RF-COL-002)."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
import uuid

from domain.collaboration.collaboration_policies import sanitize_comment_text
from domain.collaboration.comment_entity import CommentEntity
from domain.common import DomainError, ErrorOr


@dataclass
class DiscussionThreadEntity:
    id: str
    book_id: str
    project_slug: str
    title: str
    section_anchor: str = ""
    resolved: bool = False
    comments: list[CommentEntity] = field(default_factory=list)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    @classmethod
    def create_with_comment(
        cls,
        *,
        book_id: str,
        project_slug: str,
        author_name: str,
        content: str,
        title: str | None = None,
        section_anchor: str = "",
        author_email: str = "",
    ) -> ErrorOr[tuple[DiscussionThreadEntity, CommentEntity]]:
        clean_body = sanitize_comment_text(content)
        if not clean_body or len(clean_body) > 2000:
            return ErrorOr.fail(DomainError.validation("invalid_comment_content", "El comentario debe tener entre 1 y 2000 caracteres."))
        t_id = str(uuid.uuid4())
        eff_title = sanitize_comment_text(title or clean_body[:60])
        comment = CommentEntity(
            id=str(uuid.uuid4()),
            thread_id=t_id,
            book_id=book_id,
            project_slug=project_slug,
            author_name=author_name.strip() or "Colaborador",
            author_email=author_email.strip(),
            section_anchor=section_anchor.strip(),
            content=clean_body,
        )
        thread = cls(
            id=t_id,
            book_id=book_id,
            project_slug=project_slug,
            title=eff_title,
            section_anchor=section_anchor.strip(),
            resolved=False,
            comments=[comment],
        )
        return ErrorOr.ok((thread, comment))
