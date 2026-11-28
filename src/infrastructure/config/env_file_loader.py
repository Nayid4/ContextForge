"""Lightweight .env loader and provider secret resolver (SRP, 0 external dependencies)."""

from __future__ import annotations

import os
from pathlib import Path


class EnvFileLoader:
    """Loads key=value pairs from .env without overriding explicit OS/Docker environment variables."""

    PROVIDER_ENV_MAP: dict[str, str] = {
        "openai": "OPENAI_API_KEY",
        "gemini": "GEMINI_API_KEY",
        "anthropic": "ANTHROPIC_API_KEY",
        "openrouter": "OPENROUTER_API_KEY",
        "deepseek": "DEEPSEEK_API_KEY",
        "ollama": "OLLAMA_API_KEY",
        "lmstudio": "LMSTUDIO_API_KEY",
    }

    _loaded: bool = False

    @classmethod
    def load_dotenv_if_present(cls, env_path: Path | None = None, *, force: bool = False) -> int:
        if cls._loaded and not force:
            return 0
        candidates = [env_path] if env_path is not None else [
            Path.cwd() / ".env",
            Path(__file__).resolve().parents[3] / ".env",
        ]
        loaded_count = 0
        for candidate in candidates:
            if candidate is None or not candidate.is_file():
                continue
            try:
                text = candidate.read_text(encoding="utf-8")
            except OSError:
                continue
            for raw_line in text.splitlines():
                line = raw_line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                if line.startswith("export "):
                    line = line[7:].strip()
                key, val = line.split("=", 1)
                key = key.strip()
                val = val.strip()
                if not key:
                    continue
                if len(val) >= 2 and ((val[0] == '"' and val[-1] == '"') or (val[0] == "'" and val[-1] == "'")):
                    val = val[1:-1]
                if key not in os.environ:
                    os.environ[key] = val
                    loaded_count += 1
            break
        cls._loaded = True
        return loaded_count

    @classmethod
    def provider_env_var(cls, provider: str) -> str:
        return cls.PROVIDER_ENV_MAP.get((provider or "").strip().lower(), "")

    @classmethod
    def has_env_secret(cls, provider: str) -> bool:
        var_name = cls.provider_env_var(provider)
        if not var_name:
            return False
        if not os.getenv(var_name, "").strip():
            cls.load_dotenv_if_present(force=True)
        return bool(os.getenv(var_name, "").strip())

    @classmethod
    def resolve_provider_api_key(cls, provider: str, stored_plain: str = "") -> tuple[str, str]:
        """Returns (effective_api_key, source) where source in {'db', 'env', 'none'}."""
        if stored_plain and stored_plain.strip():
            return stored_plain.strip(), "db"
        var_name = cls.provider_env_var(provider)
        if var_name:
            env_val = os.getenv(var_name, "").strip()
            if not env_val:
                cls.load_dotenv_if_present(force=True)
                env_val = os.getenv(var_name, "").strip()
            if env_val:
                return env_val, "env"
        return "", "none"
