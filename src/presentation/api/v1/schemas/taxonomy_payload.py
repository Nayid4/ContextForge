"""Taxonomy item creation payload."""
from __future__ import annotations
from pydantic import BaseModel

class TaxonomyPayload(BaseModel):
    kind: str = "module"
    name: str
    slug: str | None = None
    description: str = ""
    color: str = "indigo"
