"""Chain of Responsibility contract for document ingestion validation (BR-02, BR-15)."""

from __future__ import annotations

from typing import Protocol

from domain.common import DomainError


class IDocumentGovernanceRule(Protocol):
    @property
    def rule_name(self) -> str: ...
    def validate(self, path: str, title: str, content: str) -> DomainError | None: ...
