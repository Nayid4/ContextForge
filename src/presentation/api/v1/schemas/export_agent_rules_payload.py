"""Agent CLI Rules synchronization payload (CLAUDE.md, .cursorrules, AGENTS.md)."""
from __future__ import annotations
from pydantic import BaseModel, Field

class ExportAgentRulesPayload(BaseModel):
    project_slug: str = "default"
    targets: list[str] = Field(default_factory=lambda: ["CLAUDE.md", ".cursorrules", "AGENTS.md"])
    selected_modules: list[str] = Field(default_factory=list)
    write_to_project_root: bool = True
