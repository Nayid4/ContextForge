"""Social Domain Entities: Comment and Rating."""

from __future__ import annotations

from dataclasses import dataclass
from domain.shared_kernel.entities import Entity
from domain.shared_kernel.value_objects import RatingScore
from domain.shared_kernel.exceptions import ValidationException


@dataclass
class Comment(Entity):
    """User comment associated with a Document or Book."""

    book_id: str = ""
    target_id: str = ""
    user_name: str = ""
    user_email: str = ""
    content: str = ""

    def __post_init__(self) -> None:
        if not self.target_id and self.book_id:
            self.target_id = self.book_id
        if not self.book_id and self.target_id:
            self.book_id = self.target_id
        if not self.target_id.strip():
            raise ValidationException("Comment must be associated with a valid Document or Book ID.")
        if not self.user_name.strip():
            raise ValidationException("Author name for the comment cannot be empty.")
        if not self.content.strip():
            raise ValidationException("Comment content cannot be empty.")
        if len(self.content) > 2000:
            raise ValidationException("Comment content cannot exceed 2000 characters.")


@dataclass
class Rating(Entity):
    """User rating score for a Document or Book (1 to 5)."""

    book_id: str = ""
    target_id: str = ""
    user_name: str = ""
    score: int = 5

    def __post_init__(self) -> None:
        if not self.target_id and self.book_id:
            self.target_id = self.book_id
        if not self.book_id and self.target_id:
            self.book_id = self.target_id
        if not self.target_id.strip():
            raise ValidationException("Rating must be associated with a valid target ID.")
        self.score = int(RatingScore(self.score))

