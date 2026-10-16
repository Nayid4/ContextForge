"""Handler for discovering installed CLI AI engines on the host machine."""

from __future__ import annotations

from application.settings.queries.discover_cli_engines.query import DiscoverCLIEnginesQuery
from application.settings.queries.discover_cli_engines.response import DiscoveredEngineDTO
from application.settings.queries.discover_cli_engines.validator import DiscoverCLIEnginesValidator
from infrastructure.external.llm.cli_process_client import resolve_cli_binary


class DiscoverCLIEnginesQueryHandler:
    """Scans system PATH and known OS installation directories for local AI CLI binaries."""

    SUPPORTED_BINARIES: list[dict[str, str]] = [
        {
            "provider": "antigravity_cli",
            "cmd": "agy",
            "name": "Google Antigravity CLI (agy)",
            "args": "-p {prompt}",
            "model": "gemini-3.8-flash",
        },
        {
            "provider": "claude_code_cli",
            "cmd": "claude",
            "name": "Anthropic Claude Code CLI (claude)",
            "args": "-p {prompt} --output-format text",
            "model": "claude-sonnet-4-5",
        },
        {
            "provider": "open_code_cli",
            "cmd": "opencode",
            "name": "OpenCode v2 CLI Agent (opencode)",
            "args": "run --model {model} {prompt}",
            "model": "anthropic/claude-sonnet-4-5",
        },
        {
            "provider": "codex_cli",
            "cmd": "codex",
            "name": "OpenAI Codex / Platform CLI (codex)",
            "args": "-p {prompt}",
            "model": "gpt-5.4",
        },
        {
            "provider": "gemini_cli",
            "cmd": "gemini",
            "name": "Google Gemini CLI (gemini)",
            "args": "-p {prompt}",
            "model": "gemini-2.5-pro",
        },
        {
            "provider": "aider_cli",
            "cmd": "aider",
            "name": "Aider AI Pair Programmer (aider)",
            "args": "--message {prompt}",
            "model": "qwen2.5-coder",
        },
        {
            "provider": "ollama_cli",
            "cmd": "ollama",
            "name": "Ollama Terminal CLI Nativo (ollama)",
            "args": "run {model} {prompt}",
            "model": "llama3.1:8b",
        },
    ]

    async def handle(self, query: DiscoverCLIEnginesQuery | None = None) -> list[DiscoveredEngineDTO]:
        if query is not None:
            DiscoverCLIEnginesValidator.validate(query)
        results: list[DiscoveredEngineDTO] = []
        for item in self.SUPPORTED_BINARIES:
            bin_path = resolve_cli_binary(item["cmd"])
            results.append(
                DiscoveredEngineDTO(
                    provider=item["provider"],
                    command=item["cmd"],
                    name=item["name"],
                    is_installed=bool(bin_path),
                    path=bin_path or "No encontrado en PATH",
                    recommended_args=item["args"],
                    default_model=item["model"],
                )
            )
        return results
