"""Team user creation payload (Admin only)."""

from __future__ import annotations

from pydantic import BaseModel, Field


class CreateUserPayload(BaseModel):
    email: str = Field(..., min_length=5, max_length=150)
    full_name: str = Field(..., min_length=2, max_length=120)
    password: str = Field(..., min_length=8, max_length=256)
    role: str = Field("Consumer", description="Admin | Owner | Curator | Consumer")
    must_change_password: bool = True
