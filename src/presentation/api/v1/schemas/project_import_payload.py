"""Portable project export/import bundle payload."""
from __future__ import annotations
from typing import Any
from pydantic import BaseModel, Field


class ProjectImportPayload(BaseModel):
    project: dict[str, Any] = Field(...)
    documents: list[dict[str, Any]] = Field(default_factory=list)
    agents: list[dict[str, Any]] = Field(default_factory=list)
    eval_cases: list[dict[str, Any]] = Field(default_factory=list)
