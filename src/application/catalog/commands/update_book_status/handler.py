"""Handler for UpdateBookStatusCommand."""

from __future__ import annotations

from application.catalog.commands.update_book_status.command import (
    UpdateBookStatusCommand,
)
from application.catalog.commands.update_book_status.response import (
    UpdateBookStatusResponse,
)
from application.catalog.commands.update_book_status.validator import (
    UpdateBookStatusValidator,
)
from application.commons.exceptions.application_exceptions import NotFoundException
from domain.catalog.repositories import IBookRepository


class UpdateBookStatusHandler:
    """Orchestrates updating a book status in the catalog."""

    def __init__(self, book_repo: IBookRepository) -> None:
        self._book_repo = book_repo
        self._validator = UpdateBookStatusValidator()

    async def handle(self, command: UpdateBookStatusCommand) -> UpdateBookStatusResponse:
        self._validator.validate(command)
        book = await self._book_repo.get_by_id(command.book_id)
        if not book:
            raise NotFoundException("Book", command.book_id)

        book.update_status(command.new_status)
        await self._book_repo.save(book)

        return UpdateBookStatusResponse(
            book_id=book.id,
            status=book.status,
            success=True,
            message="Book status updated successfully.",
        )

