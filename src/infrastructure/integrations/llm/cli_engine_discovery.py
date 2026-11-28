"""Discovers locally installed AI CLI tools (Ollama, Claude Code, Gemini CLI, Codex, OpenCode, Aider)."""

from __future__ import annotations

import shutil
from typing import Any


class CliEngineDiscoveryService:
    KNOWN_CLIS: tuple[tuple[str, str, str], ...] = (
        ("antigravity_cli", "Antigravity CLI (agy)", "agy"),
        ("ollama", "Ollama CLI", "ollama"),
        ("claude_cli", "Claude Code CLI", "claude"),
        ("gemini_cli", "Gemini CLI", "gemini"),
        ("codex_cli", "OpenAI Codex CLI", "codex"),
        ("opencode_cli", "OpenCode CLI", "opencode"),
        ("aider_cli", "Aider CLI", "aider"),
    )

    @classmethod
    def discover(cls) -> dict[str, Any]:
        engines: list[dict[str, Any]] = []
        installed_count = 0
        for provider, label, binary in cls.KNOWN_CLIS:
            path = shutil.which(binary)
            installed = path is not None
            if installed:
                installed_count += 1
            engines.append(
                {
                    "provider": provider,
                    "name": label,
                    "binary": binary,
                    "installed": installed,
                    "binary_path": path or "",
                }
            )
        return {"installed_count": installed_count, "total_checked": len(engines), "engines": engines}
