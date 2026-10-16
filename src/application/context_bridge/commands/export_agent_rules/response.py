"""Response DTO for ExportAgentRulesCommand."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class ExportAgentRulesResponse:
    """Result of compiling and writing an agent rules file."""

    filename: str
    file_path: str
    content: str
    token_estimate: int
    documents_included: int

    def to_dict(self) -> dict[str, Any]:
        return {
            "filename": self.filename,
            "file_path": self.file_path,
            "content": self.content,
            "token_estimate": self.token_estimate,
            "documents_included": self.documents_included,
        }

