"""Login credentials payload."""
from __future__ import annotations
from pydantic import BaseModel

class LoginPayload(BaseModel):
    email: str
    password: str
