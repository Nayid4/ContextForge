"""CLI LLM Agent Strategy."""

from __future__ import annotations

from domain.llm.entities import LLMProvider
from domain.llm.interfaces import ILLMClient
from infrastructure.external.llm.cli_process_client import CLIProcessClient
from infrastructure.external.llm.strategies.options import LLMOptions


class CliLLMStrategy:
    """Strategy for Autonomous CLI Agents (Antigravity agy, Claude Code, OpenCode v2, Codex, Gemini CLI, Aider, Ollama CLI)."""

    _DEFAULT_CMD_MAP: dict[LLMProvider, str] = {
        LLMProvider.ANTIGRAVITY_CLI: "agy",
        LLMProvider.CLAUDE_CODE_CLI: "claude",
        LLMProvider.OPEN_CODE_CLI: "opencode",
        LLMProvider.CODEX_CLI: "codex",
        LLMProvider.GEMINI_CLI: "gemini",
        LLMProvider.AIDER_CLI: "aider",
        LLMProvider.OLLAMA_CLI: "ollama",
    }

    def build_client(self, options: LLMOptions) -> ILLMClient:
        raw_cmd = (options.cli_command or "").strip()
        if raw_cmd == "antigravity":
            raw_cmd = "agy"
        elif raw_cmd == "open-code":
            raw_cmd = "opencode"

        bin_name = raw_cmd or self._DEFAULT_CMD_MAP.get(options.provider, "claude")
        return CLIProcessClient(
            binary_name=bin_name,
            base_args=options.cli_args or None,
            model=options.default_model or None,
        )

