"""Unified async HTTP adapter for Ollama, LM Studio, vLLM, OpenAI, Gemini, Anthropic, OpenRouter, and DeepSeek."""

from __future__ import annotations

import json
import time
from typing import AsyncIterator
import httpx

from domain.rag import ILLMProviderPort
from domain.users import LlmProviderConfigEntity


class HttpMultiLlmAdapter(ILLMProviderPort):
    """Multi-provider async HTTP adapter supporting real prompt verification in check_health()."""

    HEALTH_PROBE_PROMPT: str = "Responde únicamente con la palabra: OK"

    DEFAULT_BASE_URLS: dict[str, str] = {
        "ollama": "http://127.0.0.1:11434",
        "lmstudio": "http://127.0.0.1:1234/v1",
        "vllm": "http://127.0.0.1:8001/v1",
        "openai": "https://api.openai.com/v1",
        "gemini": "https://generativelanguage.googleapis.com",
        "anthropic": "https://api.anthropic.com/v1",
        "openrouter": "https://openrouter.ai/api/v1",
        "deepseek": "https://api.deepseek.com/v1",
    }

    DEFAULT_MODELS: dict[str, str] = {
        "ollama": "llama3.1:8b",
        "lmstudio": "local-model",
        "vllm": "meta-llama/Llama-3.1-8B-Instruct",
        "openai": "gpt-4o-mini",
        "gemini": "gemini-2.5-flash",
        "anthropic": "claude-3-5-sonnet-latest",
        "openrouter": "openai/gpt-4o-mini",
        "deepseek": "deepseek-chat",
    }

    def __init__(self, config: LlmProviderConfigEntity, api_key_plain: str = "", timeout_sec: float = 25.0) -> None:
        self._cfg = config
        self._api_key = api_key_plain.strip()
        self._timeout = timeout_sec

    @property
    def provider_name(self) -> str:
        return self._cfg.provider

    @property
    def engine_type(self) -> str:
        return self._cfg.engine_type

    @property
    def base_url(self) -> str:
        return (self._cfg.base_url or self.DEFAULT_BASE_URLS.get(self._cfg.provider, "")).rstrip("/")

    def _effective_model(self, override: str | None = None) -> str:
        return (override or self._cfg.default_model or self.DEFAULT_MODELS.get(self._cfg.provider, "gpt-4o-mini")).strip()

    async def generate(
        self,
        prompt: str,
        *,
        system_prompt: str | None = None,
        model: str | None = None,
        max_tokens_override: int | None = None,
    ) -> str:
        eff_model = self._effective_model(model)
        eff_max_tokens = max_tokens_override or self._cfg.max_tokens or 2048
        sys_msg = system_prompt or "Eres el asistente técnico soberano de ContextForge. Cita siempre [ruta.md]."
        prov = (self._cfg.provider or "").lower()
        base = self.base_url

        async with httpx.AsyncClient(timeout=self._timeout) as client:
            if prov == "ollama":
                url = f"{base or 'http://127.0.0.1:11434'}/api/generate"
                headers = {"Authorization": f"Bearer {self._api_key}"} if self._api_key else {}
                opts: dict[str, object] = {"temperature": self._cfg.temperature}
                if max_tokens_override is not None:
                    opts["num_predict"] = max_tokens_override
                resp = await client.post(
                    url,
                    headers=headers,
                    json={
                        "model": eff_model,
                        "prompt": f"{sys_msg}\n\n{prompt}",
                        "stream": False,
                        "options": opts,
                    },
                )
                resp.raise_for_status()
                return str(resp.json().get("response", "")).strip()

            if prov == "gemini":
                if not self._api_key:
                    raise ValueError("Falta GEMINI_API_KEY (configúrala en .env o en Ajustes).")
                root = base or "https://generativelanguage.googleapis.com"
                url = f"{root}/v1beta/models/{eff_model}:generateContent"
                resp = await client.post(
                    url,
                    params={"key": self._api_key},
                    json={
                        "systemInstruction": {"parts": [{"text": sys_msg}]},
                        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
                        "generationConfig": {
                            "temperature": self._cfg.temperature,
                            "maxOutputTokens": eff_max_tokens,
                        },
                    },
                )
                resp.raise_for_status()
                data = resp.json()
                candidates = data.get("candidates") or []
                parts = ((candidates[0].get("content") or {}).get("parts") or []) if candidates else []
                return "".join(str(p.get("text", "")) for p in parts).strip()

            if prov == "anthropic":
                if not self._api_key:
                    raise ValueError("Falta ANTHROPIC_API_KEY (configúrala en .env o en Ajustes).")
                root = base or "https://api.anthropic.com/v1"
                url = f"{root}/messages" if root.endswith("/v1") else f"{root}/v1/messages"
                resp = await client.post(
                    url,
                    headers={
                        "x-api-key": self._api_key,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json",
                    },
                    json={
                        "model": eff_model,
                        "max_tokens": min(int(eff_max_tokens), 4096),
                        "temperature": self._cfg.temperature,
                        "system": sys_msg,
                        "messages": [{"role": "user", "content": prompt}],
                    },
                )
                resp.raise_for_status()
                blocks = resp.json().get("content") or []
                return "".join(str(b.get("text", "")) for b in blocks if isinstance(b, dict)).strip()

            # OpenAI-compatible protocol: openai, lmstudio, vllm, openrouter, deepseek, custom
            if self._cfg.engine_type == "cloud_api" and not self._api_key:
                raise ValueError(f"Falta API Key para '{prov}' (configúrala en .env o en Ajustes).")
            root = base or "https://api.openai.com/v1"
            url = f"{root}/chat/completions" if not root.endswith("/chat/completions") else root
            headers = {"Content-Type": "application/json"}
            if self._api_key:
                headers["Authorization"] = f"Bearer {self._api_key}"
            if prov == "openrouter":
                headers["HTTP-Referer"] = "https://contextforge.local"
                headers["X-Title"] = "ContextForge"
            payload_json: dict[str, object] = {
                "model": eff_model,
                "temperature": self._cfg.temperature,
                "messages": [
                    {"role": "system", "content": sys_msg},
                    {"role": "user", "content": prompt},
                ],
            }
            if max_tokens_override is not None:
                payload_json["max_tokens"] = max_tokens_override
            resp = await client.post(url, headers=headers, json=payload_json)
            resp.raise_for_status()
            data = resp.json()
            return str(data["choices"][0]["message"]["content"]).strip()

    async def stream_generate(self, prompt: str, *, system_prompt: str | None = None, model: str | None = None) -> AsyncIterator[str]:
        """True token-by-token streaming for Ollama NDJSON, OpenAI-compatible SSE, Anthropic SSE, and Gemini SSE."""
        eff_model = self._effective_model(model)
        eff_max_tokens = self._cfg.max_tokens or 2048
        sys_msg = system_prompt or "Eres el asistente técnico soberano de ContextForge. Cita siempre [ruta.md]."
        prov = (self._cfg.provider or "").lower()
        base = self.base_url

        async with httpx.AsyncClient(timeout=self._timeout) as client:
            if prov == "ollama":
                url = f"{base or 'http://127.0.0.1:11434'}/api/generate"
                headers = {"Authorization": f"Bearer {self._api_key}"} if self._api_key else {}
                async with client.stream(
                    "POST",
                    url,
                    headers=headers,
                    json={
                        "model": eff_model,
                        "prompt": f"{sys_msg}\n\n{prompt}",
                        "stream": True,
                        "options": {"temperature": self._cfg.temperature},
                    },
                ) as resp:
                    resp.raise_for_status()
                    async for line in resp.aiter_lines():
                        if not line.strip():
                            continue
                        try:
                            obj = json.loads(line)
                            tok = str(obj.get("response", ""))
                            if tok:
                                yield tok
                            if obj.get("done"):
                                break
                        except Exception:
                            continue
                return

            if prov == "anthropic":
                if not self._api_key:
                    raise ValueError("Falta ANTHROPIC_API_KEY (configúrala en .env o en Ajustes).")
                root = base or "https://api.anthropic.com/v1"
                url = f"{root}/messages" if root.endswith("/v1") else f"{root}/v1/messages"
                async with client.stream(
                    "POST",
                    url,
                    headers={
                        "x-api-key": self._api_key,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json",
                    },
                    json={
                        "model": eff_model,
                        "max_tokens": min(int(eff_max_tokens), 4096),
                        "temperature": self._cfg.temperature,
                        "system": sys_msg,
                        "stream": True,
                        "messages": [{"role": "user", "content": prompt}],
                    },
                ) as resp:
                    resp.raise_for_status()
                    async for line in resp.aiter_lines():
                        if not line.startswith("data: "):
                            continue
                        raw = line[6:].strip()
                        if not raw or raw == "[DONE]":
                            continue
                        try:
                            ev = json.loads(raw)
                            if ev.get("type") == "content_block_delta":
                                tok = str((ev.get("delta") or {}).get("text", ""))
                                if tok:
                                    yield tok
                        except Exception:
                            continue
                return

            if prov == "gemini":
                if not self._api_key:
                    raise ValueError("Falta GEMINI_API_KEY (configúrala en .env o en Ajustes).")
                root = base or "https://generativelanguage.googleapis.com"
                url = f"{root}/v1beta/models/{eff_model}:streamGenerateContent"
                async with client.stream(
                    "POST",
                    url,
                    params={"key": self._api_key, "alt": "sse"},
                    json={
                        "systemInstruction": {"parts": [{"text": sys_msg}]},
                        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
                        "generationConfig": {"temperature": self._cfg.temperature, "maxOutputTokens": eff_max_tokens},
                    },
                ) as resp:
                    resp.raise_for_status()
                    async for line in resp.aiter_lines():
                        if not line.startswith("data: "):
                            continue
                        raw = line[6:].strip()
                        if not raw or raw == "[DONE]":
                            continue
                        try:
                            ev = json.loads(raw)
                            cands = ev.get("candidates") or []
                            parts = ((cands[0].get("content") or {}).get("parts") or []) if cands else []
                            for p in parts:
                                tok = str(p.get("text", ""))
                                if tok:
                                    yield tok
                        except Exception:
                            continue
                return

            # OpenAI-compatible SSE streaming: openai, lmstudio, vllm, openrouter, deepseek
            if self._cfg.engine_type == "cloud_api" and not self._api_key:
                raise ValueError(f"Falta API Key para '{prov}' (configúrala en .env o en Ajustes).")
            root = base or "https://api.openai.com/v1"
            url = f"{root}/chat/completions" if not root.endswith("/chat/completions") else root
            headers = {"Content-Type": "application/json"}
            if self._api_key:
                headers["Authorization"] = f"Bearer {self._api_key}"
            if prov == "openrouter":
                headers["HTTP-Referer"] = "https://contextforge.local"
                headers["X-Title"] = "ContextForge"
            async with client.stream(
                "POST",
                url,
                headers=headers,
                json={
                    "model": eff_model,
                    "temperature": self._cfg.temperature,
                    "stream": True,
                    "messages": [
                        {"role": "system", "content": sys_msg},
                        {"role": "user", "content": prompt},
                    ],
                },
            ) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    raw = line[6:].strip()
                    if not raw or raw == "[DONE]":
                        break
                    try:
                        ev = json.loads(raw)
                        choices = ev.get("choices") or []
                        tok = str(((choices[0].get("delta") or {}).get("content", "")) if choices else "")
                        if tok:
                            yield tok
                    except Exception:
                        continue

    async def check_health(self) -> tuple[bool, str, float]:
        """Sends an actual lightweight prompt to the selected model to prove end-to-end inference."""
        t0 = time.perf_counter()
        eff_model = self._effective_model()
        try:
            reply = await self.generate(
                self.HEALTH_PROBE_PROMPT,
                system_prompt="Responde únicamente con 'OK' para confirmar disponibilidad del modelo.",
                model=eff_model,
                max_tokens_override=24,
            )
            lat = round((time.perf_counter() - t0) * 1000.0, 2)
            preview = " ".join(reply.split())[:80] or "(vacío)"
            return True, f"Modelo '{eff_model}' verificado por prompt real. Respuesta: {preview}", lat
        except ValueError as exc:
            return False, str(exc), round((time.perf_counter() - t0) * 1000.0, 2)
        except httpx.HTTPStatusError as exc:
            lat = round((time.perf_counter() - t0) * 1000.0, 2)
            body = exc.response.text[:160].replace("\n", " ").strip()
            return False, f"HTTP {exc.response.status_code} probando '{eff_model}': {body}", lat
        except Exception as exc:
            lat = round((time.perf_counter() - t0) * 1000.0, 2)
            return False, f"No disponible probando '{eff_model}' ({type(exc).__name__}: {exc})", lat

    async def list_ollama_models(self) -> list[dict[str, object]]:
        try:
            base = (self._cfg.base_url or "http://127.0.0.1:11434").rstrip("/")
            async with httpx.AsyncClient(timeout=2.5) as client:
                r = await client.get(f"{base}/api/tags")
                if r.status_code == 200:
                    return list(r.json().get("models", []))
        except Exception:
            pass
        return []
