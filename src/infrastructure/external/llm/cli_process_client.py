"""Local CLI Process Client Adapter for executing AI terminal tools asynchronously."""

from __future__ import annotations

import asyncio
import logging
import os
from pathlib import Path
import platform
import shutil
import time
from typing import Any, AsyncGenerator
from domain.llm.interfaces import ILLMClient

logger = logging.getLogger("infrastructure.llm.cli")

CURRENT_OS: str = platform.system()  # "Windows", "Darwin", "Linux"

KNOWN_CLI_PATHS_BY_OS: dict[str, dict[str, list[str]]] = {
    "Windows": {
        "agy": [
            r"%LOCALAPPDATA%\agy\bin\agy.exe",
            r"%USERPROFILE%\AppData\Local\agy\bin\agy.exe",
            r"%LOCALAPPDATA%\Programs\agy\bin\agy.exe",
            r"%USERPROFILE%\.local\bin\agy.exe",
        ],
        "antigravity": [
            r"%LOCALAPPDATA%\agy\bin\agy.exe",
            r"%USERPROFILE%\AppData\Local\agy\bin\agy.exe",
            r"%LOCALAPPDATA%\Programs\Antigravity\antigravity.exe",
        ],
        "claude": [
            r"%USERPROFILE%\.local\bin\claude.exe",
            r"%LOCALAPPDATA%\Programs\claude\claude.exe",
            r"%LOCALAPPDATA%\AnthropicClaude\claude.exe",
            r"%APPDATA%\npm\claude.cmd",
        ],
        "opencode": [
            r"%LOCALAPPDATA%\opencode\bin\opencode.exe",
            r"%USERPROFILE%\.opencode\bin\opencode.exe",
            r"%USERPROFILE%\.local\bin\opencode.exe",
            r"%APPDATA%\npm\opencode.cmd",
        ],
        "open-code": [
            r"%LOCALAPPDATA%\opencode\bin\opencode.exe",
            r"%USERPROFILE%\.opencode\bin\opencode.exe",
            r"%APPDATA%\npm\opencode.cmd",
        ],
        "codex": [
            r"%APPDATA%\npm\codex.cmd",
            r"%USERPROFILE%\.local\bin\codex.exe",
        ],
        "openai": [
            r"%APPDATA%\npm\codex.cmd",
            r"%USERPROFILE%\.local\bin\openai.exe",
        ],
        "gemini": [
            r"%APPDATA%\npm\gemini.cmd",
            r"%USERPROFILE%\.local\bin\gemini.exe",
        ],
        "ollama": [
            r"%LOCALAPPDATA%\Programs\Ollama\ollama.exe",
        ],
        "aider": [
            r"%USERPROFILE%\.local\bin\aider.exe",
        ],
    },
    "Darwin": {
        "agy": [
            "~/.local/bin/agy",
            "~/.gemini/antigravity/bin/agy",
            "/usr/local/bin/agy",
            "/opt/homebrew/bin/agy",
            "/opt/homebrew/sbin/agy",
        ],
        "antigravity": [
            "/Applications/Antigravity.app/Contents/MacOS/antigravity",
            "~/.local/bin/agy",
            "/opt/homebrew/bin/agy",
            "/usr/local/bin/agy",
        ],
        "claude": [
            "~/.local/bin/claude",
            "/opt/homebrew/bin/claude",
            "/usr/local/bin/claude",
            "~/.npm-global/bin/claude",
        ],
        "opencode": [
            "~/.local/bin/opencode",
            "~/.opencode/bin/opencode",
            "/opt/homebrew/bin/opencode",
            "/usr/local/bin/opencode",
        ],
        "open-code": [
            "~/.local/bin/opencode",
            "/opt/homebrew/bin/opencode",
        ],
        "codex": [
            "~/.local/bin/codex",
            "/opt/homebrew/bin/codex",
            "/usr/local/bin/codex",
        ],
        "openai": [
            "~/.local/bin/openai",
            "/opt/homebrew/bin/openai",
        ],
        "gemini": [
            "~/.local/bin/gemini",
            "/opt/homebrew/bin/gemini",
            "/usr/local/bin/gemini",
        ],
        "ollama": [
            "/opt/homebrew/bin/ollama",
            "/usr/local/bin/ollama",
            "/Applications/Ollama.app/Contents/Resources/ollama",
        ],
        "aider": [
            "~/.local/bin/aider",
            "/opt/homebrew/bin/aider",
            "/usr/local/bin/aider",
        ],
    },
    "Linux": {
        "agy": [
            "~/.local/bin/agy",
            "~/.gemini/antigravity/bin/agy",
            "/usr/local/bin/agy",
            "/usr/bin/agy",
        ],
        "antigravity": [
            "~/.local/bin/agy",
            "/usr/local/bin/agy",
            "/usr/bin/agy",
        ],
        "claude": [
            "~/.local/bin/claude",
            "/usr/local/bin/claude",
            "/snap/bin/claude",
            "~/.npm-global/bin/claude",
        ],
        "opencode": [
            "~/.local/bin/opencode",
            "~/.opencode/bin/opencode",
            "/usr/local/bin/opencode",
        ],
        "open-code": [
            "~/.local/bin/opencode",
            "/usr/local/bin/opencode",
        ],
        "codex": [
            "~/.local/bin/codex",
            "/usr/local/bin/codex",
            "/snap/bin/codex",
        ],
        "openai": [
            "~/.local/bin/openai",
            "/usr/local/bin/openai",
        ],
        "gemini": [
            "~/.local/bin/gemini",
            "/usr/local/bin/gemini",
        ],
        "ollama": [
            "/usr/local/bin/ollama",
            "/usr/bin/ollama",
        ],
        "aider": [
            "~/.local/bin/aider",
            "/usr/local/bin/aider",
        ],
    },
}

BINARY_ALIASES: dict[str, list[str]] = {
    "antigravity": ["agy", "antigravity"],
    "agy": ["agy", "antigravity"],
    "open-code": ["opencode", "open-code"],
    "opencode": ["opencode", "open-code"],
    "codex": ["codex", "openai"],
    "openai": ["openai", "codex"],
}


def _get_extended_search_path() -> str:
    """Build extended PATH string containing standard developer directories for current OS."""
    extra_paths: list[str] = []
    try:
        home = Path.home()
        if CURRENT_OS == "Darwin":
            extra_paths = [
                "/opt/homebrew/bin",
                "/opt/homebrew/sbin",
                "/usr/local/bin",
                str(home / ".local/bin"),
                str(home / ".cargo/bin"),
                str(home / ".npm-global/bin"),
            ]
        elif CURRENT_OS == "Linux":
            extra_paths = [
                "/usr/local/bin",
                "/snap/bin",
                "/usr/bin",
                "/bin",
                str(home / ".local/bin"),
                str(home / ".cargo/bin"),
                str(home / ".npm-global/bin"),
            ]
        elif CURRENT_OS == "Windows":
            extra_paths = [
                os.path.expandvars(r"%LOCALAPPDATA%\agy\bin"),
                os.path.expandvars(r"%USERPROFILE%\.local\bin"),
                os.path.expandvars(r"%APPDATA%\npm"),
                os.path.expandvars(r"%LOCALAPPDATA%\Programs\Ollama"),
                os.path.expandvars(r"%LOCALAPPDATA%\Programs\claude"),
            ]
    except Exception:
        pass

    path_env = os.environ.get("PATH", "")
    valid_extras = [p for p in extra_paths if p and Path(p).is_dir()]
    return os.pathsep.join(valid_extras + [path_env]) if valid_extras else path_env


def resolve_cli_binary(binary_name: str) -> str | None:
    """Resolve a CLI executable dynamically across system PATH, aliases, and OS installation paths (Windows, Linux, macOS)."""
    raw = (binary_name or "").strip().strip('"').strip("'")
    if not raw:
        return None

    # 1. Direct explicit file path check (supports ~ and environment variables)
    expanded = os.path.expandvars(os.path.expanduser(raw))
    if Path(expanded).is_file():
        return str(Path(expanded).resolve())

    # 2. Check dynamically extended PATH across candidates
    candidates = BINARY_ALIASES.get(raw.lower(), [raw])
    search_path = _get_extended_search_path()
    for candidate in candidates:
        found = shutil.which(candidate, path=search_path)
        if found:
            return found

    # 3. Check OS-specific known fallback paths
    os_paths_map = KNOWN_CLI_PATHS_BY_OS.get(CURRENT_OS, KNOWN_CLI_PATHS_BY_OS.get("Linux", {}))
    for candidate in candidates:
        for pattern in os_paths_map.get(candidate.lower(), []):
            expanded_candidate = os.path.expandvars(os.path.expanduser(pattern))
            if Path(expanded_candidate).is_file():
                return str(Path(expanded_candidate).resolve())

    return None


class CLIProcessClient(ILLMClient):
    """Executes local CLI AI agents (Antigravity agy, Claude Code, OpenCode v2, Codex, Gemini CLI, Aider, Ollama CLI)."""

    def __init__(
        self,
        binary_name: str = "claude",
        base_args: str | list[str] | None = None,
        model: str | None = None,
        timeout_seconds: int = 60,
    ) -> None:
        raw_bin = (binary_name or "claude").strip()
        if raw_bin == "antigravity":
            raw_bin = "agy"
        elif raw_bin == "open-code":
            raw_bin = "opencode"
        self.binary_name = raw_bin
        if isinstance(base_args, list):
            self.base_args = [str(a) for a in base_args]
            self.base_args_str = " ".join(self.base_args)
        else:
            self.base_args_str = (base_args or "").strip()
            self.base_args = self.base_args_str.split() if self.base_args_str else []
        self.model = model
        self.timeout_seconds = timeout_seconds

    def _build_command(self, prompt: str, system: str | None = None, model_override: str | None = None) -> list[str]:
        """Construct safe subprocess argument list (never uses shell=True)."""
        full_prompt = f"System: {system}\n\nUser: {prompt}" if system else prompt
        resolved_bin = resolve_cli_binary(self.binary_name) or self.binary_name
        bin_stem = Path(resolved_bin).stem.lower()
        target_model = (model_override or self.model or "").strip()

        # Support explicit {prompt} / {model} placeholders if user provided a template
        if "{prompt}" in self.base_args_str:
            cmd = [resolved_bin]
            for token in self.base_args:
                if token == "{prompt}":
                    cmd.append(full_prompt)
                elif token == "{model}":
                    cmd.append(target_model or "default")
                else:
                    cmd.append(
                        token.replace("{prompt}", full_prompt).replace("{model}", target_model or "default")
                    )
            return cmd

        cmd = [resolved_bin] + list(self.base_args)

        # OpenCode v2 CLI: `opencode run --model provider/model "prompt"`
        if bin_stem in ("opencode", "open-code"):
            if "run" not in cmd:
                cmd.insert(1, "run")
            if target_model and target_model != "default" and "--model" not in cmd:
                cmd.extend(["--model", target_model])
            cmd.append(full_prompt)
            return cmd

        # Ollama CLI: `ollama run <model> "<prompt>"`
        if bin_stem == "ollama":
            if "run" not in cmd:
                cmd.append("run")
            effective_ollama_model = target_model if target_model and target_model != "default" else "llama3.1:8b"
            if effective_ollama_model not in cmd:
                cmd.append(effective_ollama_model)
            cmd.append(full_prompt)
            return cmd

        # Aider CLI: `aider --model <model> --message "<prompt>"`
        if bin_stem == "aider":
            if target_model and target_model != "default" and "--model" not in cmd:
                cmd.extend(["--model", target_model])
            if "--message" not in cmd:
                cmd.append("--message")
            cmd.append(full_prompt)
            return cmd

        # OpenAI / Codex CLI
        if bin_stem == "openai":
            if target_model and target_model != "default" and "-m" not in cmd:
                cmd.extend(["-m", target_model])
            cmd.extend(["-g", "user", full_prompt])
            return cmd

        # Claude Code CLI (`claude`), Antigravity CLI (`agy`), Gemini CLI (`gemini`), Codex (`codex`)
        if target_model and target_model != "default" and "--model" not in cmd and "-m" not in cmd:
            if bin_stem not in ("agy", "antigravity"):
                cmd.extend(["--model", target_model])

        if "-p" not in cmd and "--prompt" not in cmd:
            cmd.append("-p")
        cmd.append(full_prompt)
        return cmd

    async def test_connection(self) -> tuple[bool, str, float]:
        """Verify that the CLI binary exists in PATH or standard OS install folders and check its version."""
        t0 = time.perf_counter()
        binary_path = resolve_cli_binary(self.binary_name)
        if not binary_path:
            latency_ms = round((time.perf_counter() - t0) * 1000.0, 2)
            hint = ""
            if self.binary_name in ("agy", "antigravity"):
                if CURRENT_OS == "Windows":
                    hint = " (Verifica 'agy --version' o '%LOCALAPPDATA%\\agy\\bin\\agy.exe')"
                else:
                    hint = " (Verifica 'agy --version' o '~/.local/bin/agy' o '/opt/homebrew/bin/agy')"
            elif self.binary_name in ("opencode", "open-code"):
                hint = f" (Instala OpenCode v2 en {CURRENT_OS} con el binario en PATH)"
            elif self.binary_name == "claude":
                if CURRENT_OS == "Windows":
                    hint = " (Instala Claude Code con 'irm https://claude.ai/install.ps1 | iex' o 'winget install Anthropic.ClaudeCode')"
                elif CURRENT_OS == "Darwin":
                    hint = " (Instala Claude Code en macOS con 'brew install claude-code' o 'npm install -g @anthropic-ai/claude-code')"
                else:
                    hint = " (Instala Claude Code en Linux con 'npm install -g @anthropic-ai/claude-code' o 'curl -fsSL https://claude.ai/install.sh | sh')"
            elif self.binary_name == "ollama":
                if CURRENT_OS == "Darwin":
                    hint = " (Instala Ollama en macOS con 'brew install ollama' o descargando Ollama.app)"
                elif CURRENT_OS == "Linux":
                    hint = " (Instala Ollama en Linux con 'curl -fsSL https://ollama.com/install.sh | sh')"
                else:
                    hint = " (Instala Ollama en Windows desde ollama.com o con 'winget install Ollama.Ollama')"

            return (
                False,
                f"[{CURRENT_OS}] El comando/binario '{self.binary_name}' no está instalado o no se encuentra en el PATH del sistema.{hint}",
                latency_ms,
            )

        # Quick --version probe to confirm executable integrity
        version_info = ""
        try:
            proc = await asyncio.create_subprocess_exec(
                binary_path,
                "--version",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=4.0)
            out_txt = (stdout or stderr or b"").decode("utf-8", errors="ignore").strip().splitlines()
            if out_txt:
                version_info = f" — Versión: {out_txt[0][:60]}"
        except Exception:
            pass

        latency_ms = round((time.perf_counter() - t0) * 1000.0, 2)
        return (
            True,
            f"[{CURRENT_OS}] Binario '{Path(binary_path).name}' localizado con éxito en: {binary_path}{version_info}",
            latency_ms,
        )

    async def generate(
        self,
        prompt: str,
        system: str | None = None,
        model: str | None = None,
    ) -> str:
        """Execute full non-interactive CLI generation."""
        cmd = self._build_command(prompt, system, model_override=model)
        process: asyncio.subprocess.Process | None = None
        try:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await asyncio.wait_for(
                process.communicate(),
                timeout=float(self.timeout_seconds),
            )
        except asyncio.TimeoutError:
            if process is not None:
                try:
                    process.kill()
                except Exception:
                    pass
            raise TimeoutError(
                f"La herramienta CLI '{self.binary_name}' excedió el tiempo límite de {self.timeout_seconds}s."
            )
        except FileNotFoundError:
            raise RuntimeError(
                f"El binario '{self.binary_name}' no fue encontrado en el PATH del servidor."
            )

        if process.returncode != 0:
            error_msg = stderr.decode("utf-8", errors="ignore").strip()
            raise RuntimeError(f"Error en {self.binary_name} (código {process.returncode}): {error_msg}")

        return stdout.decode("utf-8", errors="ignore").strip()

    async def generate_completion(
        self,
        model: str,
        prompt: str,
        system_prompt: str | None = None,
    ) -> str:
        """Generate non-streaming text completion."""
        return await self.generate(prompt=prompt, system=system_prompt, model=model or self.model)

    async def stream_generate(
        self,
        prompt: str,
        system: str | None = None,
        model: str | None = None,
    ) -> AsyncGenerator[str, None]:
        """Stream tokens progressively from subprocess stdout for SSE."""
        cmd = self._build_command(prompt, system, model_override=model)
        try:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
        except FileNotFoundError:
            yield f"[CLI Error: El comando '{self.binary_name}' no está instalado en el PATH del sistema]"
            return
        except Exception as e:
            yield f"[CLI Error al iniciar '{self.binary_name}']: {str(e)}"
            return

        if process.stdout is not None:
            while True:
                chunk = await process.stdout.read(64)
                if not chunk:
                    break
                yield chunk.decode("utf-8", errors="ignore")

        await process.wait()
        if process.returncode != 0 and process.stderr is not None:
            err_bytes = await process.stderr.read()
            err_txt = err_bytes.decode("utf-8", errors="ignore").strip()
            if err_txt:
                yield f"\n[Error CLI {self.binary_name}]: {err_txt}"

    async def stream_chat(
        self,
        model: str,
        messages: list[dict[str, str]],
        system_prompt: str | None = None,
    ) -> AsyncGenerator[str, None]:
        """Stream chat completion compatible with AskRagQueryHandler and SSE endpoints."""
        conversation_parts: list[str] = []
        for msg in messages:
            role = msg.get("role", "user").capitalize()
            content = msg.get("content", "")
            conversation_parts.append(f"{role}: {content}")
        combined_prompt = "\n\n".join(conversation_parts)

        async for token in self.stream_generate(
            prompt=combined_prompt,
            system=system_prompt,
            model=model or self.model,
        ):
            yield token

    async def generate_embedding(self, model: str, text: str) -> list[float]:
        """CLI tools delegate vector embeddings to the configured Embedding Engine."""
        return []

    async def get_installed_models(self) -> list[dict[str, Any]]:
        """Return configured CLI model metadata."""
        m = self.model or "default"
        return [{"name": m, "model": m}]
