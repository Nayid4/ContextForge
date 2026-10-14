"""Current User Context Service Interface."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol


@dataclass
class CurrentUser:
    """Current authenticated or anonymous user context."""

    user_id: str
    name: str
    email: str
    roles: list[str]


class ICurrentUserService(Protocol):
    """Protocol to access current user claims and identity."""

    def get_current_user(self) -> CurrentUser:
        ...
