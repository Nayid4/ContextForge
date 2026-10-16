"""OpenAI, DeepSeek & Local OpenAI-Compatible (LM Studio, vLLM, LocalAI) HTTP Client Adapter."""

from __future__ import annotations

import json
import logging
import time
from typing import Any, AsyncGenerator
import httpx
from domain.llm.entities import is_masked_api_key, sanitize_api_key
from domain.llm.interfaces import ILLMClient

logger = logging.getLogger("infrastructure.llm.openai")


class OpenAIHttpClient(ILLMClient):
    """Client for OpenAI-compatible APIs (OpenAI, DeepSeek, LM Studio, vLLM, LocalAI, Gemini)."""

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.openai.com/v1",
        default_model: str = "gpt-4o-mini",
        timeout_seconds: float = 60.0,
        require_api_key: bool = True,
    ) -> None:
        self._raw_key_was_masked = bool(api_key and is_masked_api_key(api_key))
        self._api_key = sanitize_api_key(api_key)
        self._base_url = (base_url or "https://api.openai.com/v1").strip().rstrip("/")
        self._default_model = default_model
        self._timeout = timeout_seconds
        self._require_api_key = require_api_key

    def _get_headers(self) -> dict[str, str]:
        effective_key = self._api_key or ("local-no-key-required" if not self._require_api_key else "")
        headers: dict[str, str] = {
            "Content-Type": "application/json",
        }
        if effective_key:
            headers["Authorization"] = f"Bearer {effective_key}"
        return headers

    async def test_connection(self) -> tuple[bool, str, float]:
        """Test API key validity or local server availability and calculate latency."""
        if self._require_api_key and not self._api_key:
            if self._raw_key_was_masked:
                return (
                    False,
                    "La API Key mostrada está oculta por seguridad. Escribe o pega tu API Key real para probar o actualizar.",
                    0.0,
                )
            return False, "API Key no configurada", 0.0

        t0 = time.perf_counter()
        endpoint = f"{self._base_url}/models"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(endpoint, headers=self._get_headers())
                latency_ms = (time.perf_counter() - t0) * 1000.0
                if res.status_code == 200:
                    return True, f"Conexión exitosa con {self._base_url}", round(latency_ms, 1)
                elif res.status_code in (401, 403):
                    return False, "Error de autenticación: API Key inválida o sin permisos", round(latency_ms, 1)
                else:
                    return False, f"HTTP {res.status_code}: {res.text[:100]}", round(latency_ms, 1)
        except Exception as e:
            latency_ms = (time.perf_counter() - t0) * 1000.0
            return False, f"Error de conexión: {str(e)}", round(latency_ms, 1)

    async def stream_chat(
        self,
        model: str,
        messages: list[dict[str, str]],
        system_prompt: str | None = None,
    ) -> AsyncGenerator[str, None]:
        """Stream chat tokens via Server-Sent Events (SSE)."""
        target_model = model or self._default_model
        formatted_messages: list[dict[str, str]] = []
        if system_prompt:
            formatted_messages.append({"role": "system", "content": system_prompt})
        formatted_messages.extend(messages)

        payload = {
            "model": target_model,
            "messages": formatted_messages,
            "stream": True,
            "temperature": 0.2,
        }

        endpoint = f"{self._base_url}/chat/completions"
        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                async with client.stream(
                    "POST",
                    endpoint,
                    headers=self._get_headers(),
                    json=payload,
                ) as response:
                    if response.status_code != 200:
                        err_text = await response.aread()
                        yield f"[{self._base_url} HTTP {response.status_code}]: {err_text.decode('utf-8', errors='ignore')[:200]}"
                        return

                    async for line in response.aiter_lines():
                        clean_line = line.strip()
                        if not clean_line or not clean_line.startswith("data:"):
                            continue
                        data_str = clean_line[5:].strip()
                        if data_str == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data_str)
                            choices = chunk.get("choices", [])
                            if choices:
                                delta = choices[0].get("delta", {})
                                content = delta.get("content", "")
                                if content:
                                    yield content
                        except json.JSONDecodeError:
                            continue
        except Exception as e:
            yield f"[Error en llamada a API]: {str(e)}"

    async def generate_completion(
        self,
        model: str,
        prompt: str,
        system_prompt: str | None = None,
    ) -> str:
        """Generate text completion without streaming."""
        tokens: list[str] = []
        messages = [{"role": "user", "content": prompt}]
        async for tok in self.stream_chat(model=model, messages=messages, system_prompt=system_prompt):
            tokens.append(tok)
        return "".join(tokens)

    async def generate(
        self,
        prompt: str,
        system: str | None = None,
        model: str | None = None,
    ) -> str:
        """High-level completion method."""
        return await self.generate_completion(
            model=model or self._default_model,
            prompt=prompt,
            system_prompt=system,
        )

    async def generate_embedding(self, model: str, text: str) -> list[float]:
        """Generate dense vector embedding via /embeddings endpoint."""
        endpoint = f"{self._base_url}/embeddings"
        payload = {
            "model": model or "text-embedding-3-small",
            "input": text,
        }
        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                res = await client.post(endpoint, headers=self._get_headers(), json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return list(data.get("data", [{}])[0].get("embedding", []))
                return []
        except Exception as e:
            logger.warning("OpenAI Embedding error: %s", e)
            return []

    async def get_installed_models(self) -> list[dict[str, Any]]:
        """Fetch available models from endpoint."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(f"{self._base_url}/models", headers=self._get_headers())
                if res.status_code == 200:
                    data = res.json()
                    models = data.get("data", [])
                    return [{"name": m.get("id", ""), "model": m.get("id", "")} for m in models]
                return []
        except Exception:
            return []
