"""Activate provider payload."""
from __future__ import annotations
from pydantic import BaseModel

class ActivateProviderPayload(BaseModel):
    provider: str
