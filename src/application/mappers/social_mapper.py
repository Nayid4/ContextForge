"""Social DTO Mappers for Comments and Ratings."""

from __future__ import annotations

from typing import Any
from domain.social.entities import Comment, Rating


class SocialMapper:
    """Transforms Social domain entities to structured dictionaries and DTOs."""

    @staticmethod
    def comment_to_dto(comment: Comment) -> dict[str, Any]:
        return {
            "id": comment.id,
            "target_id": comment.target_id,
            "book_id": comment.book_id,
            "user_name": comment.user_name,
            "user_email": comment.user_email,
            "content": comment.content,
            "created_at": comment.created_at.isoformat(),
        }

    @staticmethod
    def rating_to_dto(rating: Rating) -> dict[str, Any]:
        return {
            "id": rating.id,
            "target_id": rating.target_id,
            "book_id": rating.book_id,
            "user_name": rating.user_name,
            "score": rating.score,
            "created_at": rating.created_at.isoformat(),
        }
