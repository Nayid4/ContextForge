"""Handler for GetBookDraftQuery."""

from __future__ import annotations

from application.book_registry.queries.get_book_draft.query import (
    GetBookDraftQuery,
)
from application.book_registry.queries.get_book_draft.response import (
    GetBookDraftResponse,
)
from application.book_registry.queries.get_book_draft.validator import (
    GetBookDraftValidator,
)
from application.mappers.book_registry_mapper import BookRegistryMapper
from domain.book_registry.repositories import IBookRegistryRepository


class GetBookDraftHandler:
    """Retrieves draft book from repository."""

    def __init__(self, draft_repo: IBookRegistryRepository) -> None:
        self._draft_repo = draft_repo
        self._validator = GetBookDraftValidator()

    async def handle(self, query: GetBookDraftQuery) -> GetBookDraftResponse:
        self._validator.validate(query)
        draft = await self._draft_repo.get_draft(query.draft_id)
        if not draft:
            return GetBookDraftResponse(draft=None, found=False)
        return GetBookDraftResponse(
            draft=BookRegistryMapper.draft_to_dto(draft),
            found=True,
        )

