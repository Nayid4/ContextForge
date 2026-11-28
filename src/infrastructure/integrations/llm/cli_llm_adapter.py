"""Sandboxed async subprocess adapter for local AI CLIs (isolated empty cwd, stripped secrets & positive flag allowlist)."""

from __future__ import annotations

import asyncio
import os
import shlex
import shutil
import subprocess
import tempfile
import time
from typing import AsyncIterator

from domain.rag import ILLMProviderPort
from domain.users import CliSecurityPolicy, LlmProviderConfigEntity


class CliLlmAdapter(ILLMProviderPort):
    """Executes allowlisted AI CLIs inside an isolated empty sandbox directory with server secrets stripped (BR-17)."""

    DEFAULT_BINARIES: dict[str, tuple[str, list[str]]] = {
        "antigravity_cli": ("agy", ["--disable-slash-commands", "--effort", "low", "-p"]),
        "claude_cli": ("claude", ["--tools", "", "--max-turns", "1", "-p"]),
        "gemini_cli": ("gemini", ["-p"]),
        "codex_cli": ("codex", ["exec", "--sandbox", "read-only"]),
        "opencode_cli": ("opencode", ["run"]),
        "aider_cli": ("aider", ["--no-auto-commits", "--no-git", "--message"]),
    }

    STRIPPED_ENV_KEYS: frozenset[str] = frozenset(
        {
            "MASTER_VAULT_KEY",
            "JWT_SECRET_KEY",
            "DATABASE_URL",
            "POSTGRES_PASSWORD",
            "AWS_SECRET_ACCESS_KEY",
            "AZURE_STORAGE_CONNECTION_STRING",
            "CONTEXTFORGE_MASTER_KEY",
        }
    )

    HEALTH_PROBE_PROMPT: str = "Responde únicamente con la palabra: OK"

    def __init__(self, config: LlmProviderConfigEntity, timeout_sec: float = 120.0) -> None:
        self._cfg = config
        self._timeout = timeout_sec

    @property
    def provider_name(self) -> str:
        return self._cfg.provider

    @property
    def engine_type(self) -> str:
        return "local_cli"

    @property
    def base_url(self) -> str:
        return self._cfg.cli_command or self.DEFAULT_BINARIES.get(self._cfg.provider, ("agy", []))[0]

    def _resolve_command(self, full_prompt: str, model: str | None = None) -> tuple[str | None, list[str]]:
        default_bin, default_args = self.DEFAULT_BINARIES.get(self._cfg.provider, (self._cfg.provider, ["-p"]))
        binary_name = (self._cfg.cli_command or default_bin).strip()
        raw_args = (self._cfg.cli_args or "").strip()
        if self._cfg.provider == "antigravity_cli" and raw_args in {"", "chat -p", "-p --disable-slash-commands", "--disable-slash-commands -p"}:
            args = list(default_args)
        else:
            args = shlex.split(raw_args) if raw_args else list(default_args)

        # Enforce hardened tool-free flags for agentic CLIs
        if binary_name.lower().removesuffix(".exe") == "claude" and "--tools" not in args:
            args = ["--tools", "", "--max-turns", "1", *args]
        if binary_name.lower().removesuffix(".exe") == "codex" and "--sandbox" not in args:
            args = [*args, "--sandbox", "read-only"]

        pol = CliSecurityPolicy.validate(binary_name, args)
        if pol.is_error:
            raise PermissionError(pol.first_error.message)
        resolved_bin = shutil.which(binary_name)
        if not resolved_bin:
            return None, []
        eff_model = (model or self._cfg.default_model or "").strip()
        if eff_model and eff_model not in {"default", "auto"}:
            # Strip --effort <val> when an explicit model is chosen (many agy models encode effort in their ID and reject --effort)
            if self._cfg.provider == "antigravity_cli":
                cleaned_args: list[str] = []
                skip_next = False
                for tok in args:
                    if skip_next:
                        skip_next = False
                        continue
                    if tok == "--effort":
                        skip_next = True
                        continue
                    if tok.startswith("--effort="):
                        continue
                    cleaned_args.append(tok)
                args = cleaned_args
            if "--model" not in args and "-m" not in args:
                if self._cfg.provider in {"antigravity_cli", "claude_cli", "gemini_cli", "opencode_cli", "aider_cli"}:
                    args = ["--model", eff_model, *args]
        return resolved_bin, [*args, full_prompt]

    @classmethod
    def _build_sandbox_env(cls) -> dict[str, str]:
        return {k: v for k, v in os.environ.items() if k.upper() not in cls.STRIPPED_ENV_KEYS}

    @classmethod
    def _run_subprocess(cls, cmd: list[str], timeout_sec: float) -> subprocess.CompletedProcess[str]:
        with tempfile.TemporaryDirectory(prefix="cf_cli_sandbox_") as sandbox_dir:
            return subprocess.run(
                cmd,
                cwd=sandbox_dir,
                env=cls._build_sandbox_env(),
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=timeout_sec,
                stdin=subprocess.DEVNULL,
                check=False,
            )

    async def generate(self, prompt: str, *, system_prompt: str | None = None, model: str | None = None) -> str:
        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
        binary, args = self._resolve_command(full_prompt, model=model)
        if not binary:
            expected = self._cfg.cli_command or self.DEFAULT_BINARIES.get(self._cfg.provider, (self._cfg.provider, []))[0]
            raise RuntimeError(f"CLI '{expected}' no encontrado en PATH.")
        try:
            completed = await asyncio.to_thread(self._run_subprocess, [binary, *args], self._timeout)
        except subprocess.TimeoutExpired as exc:
            raise RuntimeError(f"Tiempo agotado ({self._timeout:.0f}s) ejecutando CLI '{binary}'.") from exc
        stdout = (completed.stdout or "").strip()
        stderr = (completed.stderr or "").strip()
        if completed.returncode != 0:
            detail = stderr or stdout or f"exit code {completed.returncode}"
            raise RuntimeError(f"CLI falló (código {completed.returncode}): {detail[:240]}")
        return stdout

    async def stream_generate(self, prompt: str, *, system_prompt: str | None = None, model: str | None = None) -> AsyncIterator[str]:
        text = await self.generate(prompt, system_prompt=system_prompt, model=model)
        for word in text.split(" "):
            yield word + " "

    async def check_health(self) -> tuple[bool, str, float]:
        t0 = time.perf_counter()
        default_bin, _ = self.DEFAULT_BINARIES.get(self._cfg.provider, (self._cfg.provider, []))
        binary_name = (self._cfg.cli_command or default_bin).strip()
        resolved = shutil.which(binary_name)
        if not resolved:
            lat = round((time.perf_counter() - t0) * 1000.0, 2)
            return False, f"Binario '{binary_name}' no encontrado en PATH.", lat
        try:
            reply = await self.generate(
                self.HEALTH_PROBE_PROMPT,
                system_prompt=None,
                model=self._cfg.default_model or None,
            )
            lat = round((time.perf_counter() - t0) * 1000.0, 2)
            snippet = " ".join(reply.split())[:100] or "(respuesta vacía)"
            return True, f"CLI '{binary_name}' verificado en sandbox por prompt real. Respuesta: {snippet}", lat
        except Exception as exc:
            lat = round((time.perf_counter() - t0) * 1000.0, 2)
            detail = str(exc).strip() or type(exc).__name__
            return False, f"CLI '{binary_name}' detectado en {resolved}, pero falló el prompt de prueba: {detail}", lat
