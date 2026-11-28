from __future__ import annotations
from application.collaboration.commands.PostDocumentComment.PostDocumentCommentCommand import PostDocumentCommentCommand
from domain.collaboration import DiscussionThreadEntity, ICollaborationRepositoryPort, sanitize_comment_text
from domain.common import ErrorOr
from domain.ports import IRealtimeNotifier

class PostDocumentCommentCommandHandler:
    def __init__(self, collab_repo: ICollaborationRepositoryPort, notifier: IRealtimeNotifier | None = None) -> None:
        self._repo = collab_repo
        self._notifier = notifier

    async def handle(self, request: PostDocumentCommentCommand) -> ErrorOr[DiscussionThreadEntity]:
        book_id = f"{request.project_slug}:{request.doc_path.strip()}"
        clean_content = sanitize_comment_text(request.content)
        thread = await self._repo.create_thread_or_reply(
            book_id=book_id,
            project_slug=request.project_slug,
            author_name=request.author_name.strip() or "Colaborador",
            content=clean_content,
            thread_id=request.thread_id,
            title=sanitize_comment_text(request.title) if request.title else None,
            section_anchor=request.section_anchor,
            author_email=request.author_email,
            author_id=request.author_id,
        )
        if self._notifier:
            await self._notifier.broadcast_project_event(
                request.project_slug,
                "comment.created",
                {"doc_path": request.doc_path, "thread_id": thread.id, "author": request.author_name},
                doc_path=request.doc_path,
            )
        return ErrorOr.ok(thread)
