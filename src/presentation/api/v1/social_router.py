"""Social REST API v1 Router for comments, ratings, and feedback."""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from application.social.commands.add_comment import (
    AddCommentCommand,
    AddCommentHandler,
)
from application.social.commands.moderate_comment import (
    ModerateCommentCommand,
    ModerateCommentHandler,
)
from application.social.queries.get_book_comments import (
    GetBookCommentsHandler,
    GetBookCommentsQuery,
)
from infrastructure.repositories.sql_social_repo import SqlSocialRepository
from presentation.api.dependencies import get_social_repo

router = APIRouter(prefix="/social", tags=["Social & Discussion"])


class CreateCommentPayload(BaseModel):
    target_id: str = Field(..., description="Document path or Book ID")
    user_name: str = Field(..., description="Author name")
    user_email: str = Field(default="", description="Author email")
    content: str = Field(..., max_length=2000, description="Comment body")


@router.post("/comments", status_code=status.HTTP_201_CREATED, summary="Post comment on a document")
async def post_comment(
    payload: CreateCommentPayload,
    social_repo: SqlSocialRepository = Depends(get_social_repo),
) -> dict[str, Any]:
    handler = AddCommentHandler(social_repo)
    try:
        res = await handler.handle(
            AddCommentCommand(
                target_id=payload.target_id,
                user_name=payload.user_name,
                user_email=payload.user_email,
                content=payload.content,
            )
        )
        return {
            "comment_id": res.comment_id,
            "success": res.success,
            "message": res.message,
            "comment": res.comment,
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/comments", summary="Retrieve comments for a document")
async def get_comments(
    target_id: str = Query(..., description="Document path or Book ID"),
    social_repo: SqlSocialRepository = Depends(get_social_repo),
) -> dict[str, Any]:
    handler = GetBookCommentsHandler(social_repo)
    res = await handler.handle(GetBookCommentsQuery(target_id=target_id))
    return {
        "target_id": res.target_id,
        "comments": res.comments,
        "count": res.count,
    }


@router.delete("/comments/{comment_id}", summary="Delete or moderate a comment")
async def delete_comment(
    comment_id: str,
    social_repo: SqlSocialRepository = Depends(get_social_repo),
) -> dict[str, Any]:
    handler = ModerateCommentHandler(social_repo)
    try:
        res = await handler.handle(
            ModerateCommentCommand(comment_id=comment_id, action="delete")
        )
        return {
            "comment_id": res.comment_id,
            "success": res.success,
            "message": res.message,
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
