"""Shared Kernel Value Objects."""

from __future__ import annotations

from dataclasses import dataclass
import re
from domain.shared_kernel.exceptions import ValidationException


@dataclass(frozen=True)
class ISBN:
    """Value object representing an ISBN code."""

    value: str

    def __post_init__(self) -> None:
        clean = re.sub(r"[\s-]", "", self.value)
        if not clean:
            raise ValidationException("ISBN cannot be empty.")
        if len(clean) not in (10, 13):
            raise ValidationException(f"Invalid ISBN length: {len(clean)}. Must be 10 or 13 digits.")
        object.__setattr__(self, "value", clean)

    def __str__(self) -> str:
        return self.value


@dataclass(frozen=True)
class RatingScore:
    """Value object representing a score between 1 and 5."""

    value: int

    def __post_init__(self) -> None:
        if not (1 <= self.value <= 5):
            raise ValidationException(f"Rating score must be between 1 and 5, got {self.value}.")

    def __int__(self) -> int:
        return self.value


@dataclass(frozen=True)
class MarkdownText:
    """Value object representing valid Markdown content."""

    content: str

    def __post_init__(self) -> None:
        if not self.content.strip():
            raise ValidationException("Markdown content cannot be empty or purely whitespace.")

    def word_count(self) -> int:
        return len(self.content.split())

    def estimated_reading_time_minutes(self) -> int:
        words = self.word_count()
        return max(1, round(words / 200))

