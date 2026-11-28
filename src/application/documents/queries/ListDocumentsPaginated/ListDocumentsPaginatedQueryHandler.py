"""ListDocumentsPaginated Query Handler."""

from __future__ import annotations

from application.documents.queries.ListDocumentsPaginated.ListDocumentsPaginatedQuery import ListDocumentsPaginatedQuery
from domain.common import ErrorOr, PagedResult, PageParams
from domain.documents import DocumentAggregate, EditorialStatus, IDocumentRepositoryPort


class ListDocumentsPaginatedQueryHandler:
    def __init__(self, doc_repo: IDocumentRepositoryPort) -> None:
        self._doc_repo = doc_repo

    async def handle(self, request: ListDocumentsPaginatedQuery) -> ErrorOr[PagedResult[DocumentAggregate]]:
        status_filter: EditorialStatus | None = None
        if request.status and request.status.strip() and request.status != "all":
            parsed = EditorialStatus.parse(request.status)
            if parsed.is_error:
                return ErrorOr.fail(*parsed.errors)
            status_filter = parsed.value
        paged = await self._doc_repo.list_paginated(
            project_slug=request.project_slug,
            module_name=request.module_name,
            status=status_filter,
            search=request.search,
            pagination=PageParams(page=request.page, page_size=request.page_size),
        )
        return ErrorOr.ok(paged)
