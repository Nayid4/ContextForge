"""Password change request payload for mandatory bootstrap rotation or user self-service."""

from __future__ import annotations

from pydantic import BaseModel, Field


class ChangePasswordPayload(BaseModel):
    current_password: str = Field(..., min_length=1, max_length=256)
    new_password: str = Field(..., min_length=8, max_length=256)
