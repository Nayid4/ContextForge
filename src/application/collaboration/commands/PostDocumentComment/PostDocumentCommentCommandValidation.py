from __future__ import annotations
from application.collaboration.commands.PostDocumentComment.PostDocumentCommentCommand import PostDocumentCommentCommand
from domain.common import DomainError

class PostDocumentCommentCommandValidation:
    def validate(self, request: PostDocumentCommentCommand) -> list[DomainError]:
        errs: list[DomainError] = []
        if not request.doc_path.strip():
            errs.append(DomainError.validation("empty_doc_path", "doc_path es obligatorio."))
        if not request.content.strip() or len(request.content.strip()) > 2000:
            errs.append(DomainError.validation("invalid_comment_content", "El comentario debe tener entre 1 y 2000 caracteres."))
        return errs
