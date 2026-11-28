"""Authenticated platform user entity."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone

from domain.users.user_role import UserRole


@dataclass(frozen=True)
class UserEntity:
    user_id: str
    email: str
    full_name: str
    password_hash: str
    role: UserRole
    is_active: bool = True
    must_change_password: bool = False
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
