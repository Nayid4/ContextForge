"""Catalog REST API v1 Router."""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from application.catalog.commands.update_book_status import (
    UpdateBookStatusCommand,
    UpdateBookStatusHandler,
)
from application.catalog.queries.get_books import GetBooksHandler, GetBooksQuery
from application.catalog.queries.get_library_catalog import (
    GetLibraryCatalogHandler,
    GetLibraryCatalogQuery,
)
from infrastructure.repositories.sql_catalog_repo import (
    SqlBookRepository,
    SqlLibraryRepository,
)
from presentation.api.dependencies import get_book_repo, get_library_repo

router = APIRouter(prefix="/catalog", tags=["Catalog"])


class UpdateStatusPayload(BaseModel):
    new_status: str = Field(..., description="Target status: published, draft, archived")


@router.get("/libraries", summary="List registered libraries / projects")
async def list_libraries(
    library_repo: SqlLibraryRepository = Depends(get_library_repo),
) -> dict[str, Any]:
    handler = GetLibraryCatalogHandler(library_repo)
    res = await handler.handle(GetLibraryCatalogQuery())
    return {
        "libraries": res.libraries,
        "active_library": res.active_library,
    }


@router.get("/books", summary="List books / documents")
async def list_books(
    library_slug: str | None = Query(None, description="Optional library slug filter"),
    book_repo: SqlBookRepository = Depends(get_book_repo),
) -> dict[str, Any]:
    handler = GetBooksHandler(book_repo)
    res = await handler.handle(GetBooksQuery(library_slug=library_slug))
    return {
        "books": res.books,
        "count": res.count,
    }


@router.patch("/books/{book_id}/status", summary="Update status of a book")
async def update_book_status(
    book_id: str,
    payload: UpdateStatusPayload,
    book_repo: SqlBookRepository = Depends(get_book_repo),
) -> dict[str, Any]:
    handler = UpdateBookStatusHandler(book_repo)
    try:
        res = await handler.handle(
            UpdateBookStatusCommand(book_id=book_id, new_status=payload.new_status)
        )
        return {
            "book_id": res.book_id,
            "status": res.status,
            "success": res.success,
            "message": res.message,
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
