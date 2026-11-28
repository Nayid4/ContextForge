"""Dynamic model discovery across Local HTTP (Ollama/LMStudio/vLLM), Cloud APIs (OpenAI/Gemini/Anthropic/OpenRouter/DeepSeek), and Local CLIs (agy/opencode)."""

from __future__ import annotations

import asyncio
import shutil
import subprocess
from typing import Any
import httpx


class ProviderModelDiscoveryService:
    """Queries live model catalogs for HTTP, Cloud API, and Local CLI providers with safe curated fallbacks."""

    FALLBACK_CATALOG: dict[str, list[dict[str, str]]] = {
        "ollama": [
            {"id": "llama3.1:8b", "label": "Llama 3.1 8B"},
            {"id": "llama3.2:1b", "label": "Llama 3.2 1B (Rápido)"},
            {"id": "qwen2.5-coder:7b", "label": "Qwen 2.5 Coder 7B"},
            {"id": "gemma3:4b", "label": "Gemma 3 4B"},
        ],
        "lmstudio": [{"id": "local-model", "label": "Modelo cargado en LM Studio"}],
        "vllm": [{"id": "meta-llama/Llama-3.1-8B-Instruct", "label": "Llama 3.1 8B Instruct"}],
        "openai": [
            {"id": "gpt-4o-mini", "label": "GPT-4o mini (Rápido)"},
            {"id": "gpt-4o", "label": "GPT-4o"},
            {"id": "gpt-4.1-mini", "label": "GPT-4.1 mini"},
            {"id": "o3-mini", "label": "o3-mini"},
        ],
        "gemini": [
            {"id": "gemini-2.5-flash", "label": "Gemini 2.5 Flash (Rápido)"},
            {"id": "gemini-2.5-pro", "label": "Gemini 2.5 Pro"},
            {"id": "gemini-2.0-flash", "label": "Gemini 2.0 Flash"},
        ],
        "anthropic": [
            {"id": "claude-3-5-haiku-latest", "label": "Claude 3.5 Haiku (Rápido)"},
            {"id": "claude-3-5-sonnet-latest", "label": "Claude 3.5 Sonnet"},
            {"id": "claude-3-7-sonnet-latest", "label": "Claude 3.7 Sonnet"},
        ],
        "openrouter": [
            {"id": "openai/gpt-4o-mini", "label": "OpenAI GPT-4o mini"},
            {"id": "google/gemini-2.5-flash", "label": "Google Gemini 2.5 Flash"},
            {"id": "anthropic/claude-3.5-sonnet", "label": "Anthropic Claude 3.5 Sonnet"},
            {"id": "deepseek/deepseek-chat", "label": "DeepSeek Chat"},
        ],
        "deepseek": [
            {"id": "deepseek-chat", "label": "DeepSeek Chat (V3)"},
            {"id": "deepseek-reasoner", "label": "DeepSeek Reasoner (R1)"},
        ],
        "antigravity_cli": [
            {"id": "default", "label": "Predeterminado de Antigravity CLI"},
            {"id": "gemini-3.8-flash-low", "label": "Gemini 3.8 Flash (Low - Más rápido)"},
            {"id": "gemini-3.8-flash-medium", "label": "Gemini 3.8 Flash (Medium)"},
        ],
        "claude_cli": [
            {"id": "haiku", "label": "Claude Haiku (Rápido)"},
            {"id": "sonnet", "label": "Claude Sonnet"},
            {"id": "opus", "label": "Claude Opus"},
        ],
        "gemini_cli": [
            {"id": "gemini-2.5-flash", "label": "Gemini 2.5 Flash"},
            {"id": "gemini-2.5-pro", "label": "Gemini 2.5 Pro"},
        ],
        "codex_cli": [
            {"id": "default", "label": "Predeterminado Codex"},
            {"id": "o3-mini", "label": "o3-mini"},
            {"id": "gpt-4o", "label": "GPT-4o"},
        ],
        "opencode_cli": [{"id": "default", "label": "Predeterminado OpenCode"}],
        "aider_cli": [{"id": "default", "label": "Predeterminado Aider"}],
        "extractive_fallback": [{"id": "extractive-v2", "label": "Extractivo Determinista (0ms)"}],
    }

    @staticmethod
    def _run_cli(cmd: list[str], timeout_sec: float = 12.0) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=timeout_sec,
            stdin=subprocess.DEVNULL,
            check=False,
        )

    @classmethod
    async def discover_models(
        cls,
        *,
        provider: str,
        engine_type: str = "local_http",
        base_url: str = "",
        api_key: str = "",
        cli_command: str = "",
    ) -> dict[str, Any]:
        prov = (provider or "").strip().lower()
        base = (base_url or "").strip().rstrip("/")
        key = (api_key or "").strip()

        try:
            # 1. Local CLI live discovery
            if engine_type == "local_cli" or prov.endswith("_cli"):
                if prov == "antigravity_cli":
                    binary = shutil.which((cli_command or "agy").strip())
                    if binary:
                        proc = await asyncio.to_thread(cls._run_cli, [binary, "models"], 15.0)
                        parsed: list[dict[str, str]] = [{"id": "default", "label": "Predeterminado de Antigravity CLI"}]
                        seen: set[str] = {"default"}
                        for line in (proc.stdout or "").splitlines():
                            line = line.strip()
                            if not line or line.lower().startswith("fetching"):
                                continue
                            if "\t" in line:
                                mid, mlabel = [p.strip() for p in line.split("\t", 1)]
                            else:
                                parts = line.split(None, 1)
                                mid = parts[0].strip()
                                mlabel = parts[1].strip() if len(parts) > 1 else mid
                            if mid and mid not in seen:
                                seen.add(mid)
                                parsed.append({"id": mid, "label": mlabel})
                        if len(parsed) > 1:
                            return {
                                "provider": prov,
                                "source": "live",
                                "count": len(parsed),
                                "models": parsed,
                                "message": f"{len(parsed) - 1} modelos detectados en vivo desde `agy models`.",
                            }

                if prov == "opencode_cli":
                    binary = shutil.which((cli_command or "opencode").strip())
                    if binary:
                        proc = await asyncio.to_thread(cls._run_cli, [binary, "models"], 10.0)
                        parsed_oc = [
                            {"id": ln.strip(), "label": ln.strip()}
                            for ln in (proc.stdout or "").splitlines()
                            if ln.strip() and not ln.strip().startswith("#")
                        ]
                        if parsed_oc:
                            return {
                                "provider": prov,
                                "source": "live",
                                "count": len(parsed_oc),
                                "models": parsed_oc[:80],
                                "message": f"{len(parsed_oc)} modelos detectados desde `opencode models`.",
                            }

                fb = cls.FALLBACK_CATALOG.get(prov, [{"id": "default", "label": "default"}])
                return {
                    "provider": prov,
                    "source": "fallback",
                    "count": len(fb),
                    "models": fb,
                    "message": "Catálogo sugerido para CLI local (puedes escribir cualquier modelo manualmente).",
                }

            # 2. Extractive fallback
            if prov == "extractive_fallback" or engine_type == "extractive_fallback":
                fb = cls.FALLBACK_CATALOG["extractive_fallback"]
                return {"provider": prov, "source": "live", "count": len(fb), "models": fb, "message": "Motor determinista local."}

            # 3. HTTP / Cloud APIs live discovery
            async with httpx.AsyncClient(timeout=8.0) as client:
                if prov == "ollama":
                    root = base or "http://127.0.0.1:11434"
                    r = await client.get(f"{root}/api/tags")
                    r.raise_for_status()
                    raw_models = r.json().get("models", [])
                    models = []
                    for m in raw_models:
                        name = str(m.get("name", "")).strip()
                        if not name:
                            continue
                        size_gb = round(float(m.get("size", 0)) / (1024 ** 3), 1) if m.get("size") else 0
                        lbl = f"{name} ({size_gb} GB)" if size_gb else name
                        models.append({"id": name, "label": lbl})
                    if models:
                        return {"provider": prov, "source": "live", "count": len(models), "models": models, "message": f"{len(models)} modelos locales detectados en Ollama."}

                elif prov == "gemini":
                    if key:
                        root = base or "https://generativelanguage.googleapis.com"
                        r = await client.get(f"{root}/v1beta/models", params={"key": key})
                        r.raise_for_status()
                        models = []
                        for m in r.json().get("models", []):
                            methods = m.get("supportedGenerationMethods") or []
                            if "generateContent" not in methods:
                                continue
                            mid = str(m.get("name", "")).replace("models/", "").strip()
                            lbl = str(m.get("displayName", mid)).strip()
                            if mid:
                                models.append({"id": mid, "label": lbl})
                        if models:
                            return {"provider": prov, "source": "live", "count": len(models), "models": models[:80], "message": f"{len(models)} modelos detectados en vivo desde Google Gemini API."}

                elif prov == "anthropic":
                    if key:
                        root = base or "https://api.anthropic.com/v1"
                        url = f"{root}/models" if root.endswith("/v1") else f"{root}/v1/models"
                        r = await client.get(url, headers={"x-api-key": key, "anthropic-version": "2023-06-01"})
                        r.raise_for_status()
                        models = [
                            {"id": str(m.get("id", "")), "label": str(m.get("display_name") or m.get("id", ""))}
                            for m in r.json().get("data", [])
                            if m.get("id")
                        ]
                        if models:
                            return {"provider": prov, "source": "live", "count": len(models), "models": models[:80], "message": f"{len(models)} modelos detectados en vivo desde Anthropic API."}

                else:
                    # OpenAI, LM Studio, vLLM, OpenRouter, DeepSeek (OpenAI-compatible GET /models)
                    root = base or {
                        "openai": "https://api.openai.com/v1",
                        "lmstudio": "http://127.0.0.1:1234/v1",
                        "vllm": "http://127.0.0.1:8001/v1",
                        "openrouter": "https://openrouter.ai/api/v1",
                        "deepseek": "https://api.deepseek.com/v1",
                    }.get(prov, "")
                    if root and (key or engine_type == "local_http" or prov == "openrouter"):
                        headers = {"Authorization": f"Bearer {key}"} if key else {}
                        url = f"{root}/models" if not root.endswith("/models") else root
                        r = await client.get(url, headers=headers)
                        r.raise_for_status()
                        items = r.json().get("data", [])
                        models = [
                            {"id": str(m.get("id", "")), "label": str(m.get("name") or m.get("id", ""))}
                            for m in items
                            if isinstance(m, dict) and m.get("id")
                        ]
                        if models:
                            models.sort(key=lambda x: x["id"])
                            return {"provider": prov, "source": "live", "count": len(models), "models": models[:120], "message": f"{len(models)} modelos detectados en vivo desde {prov}."}
        except Exception as exc:
            fb = cls.FALLBACK_CATALOG.get(prov, [])
            return {
                "provider": prov,
                "source": "fallback",
                "count": len(fb),
                "models": fb,
                "message": f"Usando catálogo sugerido (no se pudo consultar en vivo: {type(exc).__name__}).",
            }

        fb = cls.FALLBACK_CATALOG.get(prov, [])
        return {
            "provider": prov,
            "source": "fallback",
            "count": len(fb),
            "models": fb,
            "message": "Usando catálogo sugerido (agrega tu API Key o inicia el servidor local para listar modelos en vivo).",
        }
