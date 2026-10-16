"""Command for exporting local AI agent instruction files (CLAUDE.md, .cursorrules, AGENTS.md)."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class ExportAgentRulesCommand:
    """Command to compile and export project documentation rules for terminal/IDE AI agents."""

    project_slug: str = "default"
    agent_target: str = "claude_md"  # "claude_md" (CLAUDE.md), "cursorrules" (.cursorrules), "agents_md" (AGENTS.md)
    modules: list[str] = field(default_factory=list)
    max_tokens: int = 16000

