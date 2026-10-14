"""Anthropic (Claude) HTTP Client Adapter for LLM inference."""

from __future__ import annotations

import json
import logging
import time
from typing import Any, AsyncGenerator
import httpx
from domain.llm.interfaces import ILLMClient

logger = logging.getLogger("infrastructure.llm.anthropic")


class AnthropicHttpClient(ILLMClient):
    """Client for Anthropic Claude Messages API."""

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.anthropic.com/v1",
        default_model: str = "claude-3-5-sonnet-20241022",
        timeout_seconds: float = 60.0,
    ) -> None:
        self._api_key = api_key
        self._base_url = base_url.rstrip("/")
        self._default_model = default_model
        self._timeout = timeout_seconds

    def _get_headers(self) -> dict[str, str]:
        return {
            "Content-Type": "application/json",
            "x-api-key": self._api_key,
            "anthropic-version": "2023-06-01",
        }

    async def test_connection(self) -> tuple[bool, str, float]:
        """Test API key by sending a 1-token test prompt."""
        if not self._api_key:
            return False, "API Key de Anthropic no configurada", 0.0

        t0 = time.perf_counter()
        endpoint = f"{self._base_url}/messages"
        payload = {
            "model": "claude-3-haiku-20240307",
            "max_tokens": 1,
            "messages": [{"role": "user", "content": "ping"}],
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(endpoint, headers=self._get_headers(), json=payload)
                latency_ms = (time.perf_counter() - t0) * 1000.0
                if res.status_code == 200:
                    return True, "Conexión con Anthropic Claude exitosa", round(latency_ms, 1)
                elif res.status_code == 401:
                    return False, "Error 401: API Key de Anthropic inválida", round(latency_ms, 1)
                else:
                    data = res.json() if res.headers.get("content-type", "").startswith("application/json") else {}
                    msg = data.get("error", {}).get("message", res.text[:100])
                    return False, f"Anthropic HTTP {res.status_code}: {msg}", round(latency_ms, 1)
        except Exception as e:
            latency_ms = (time.perf_counter() - t0) * 1000.0
            return False, f"Error de conexión con Anthropic: {str(e)}", round(latency_ms, 1)

    async def stream_chat(
        self,
        model: str,
        messages: list[dict[str, str]],
        system_prompt: str | None = None,
    ) -> AsyncGenerator[str, None]:
        """Stream Claude responses via Anthropic Messages SSE API."""
        target_model = model or self._default_model
        formatted_messages = [
            {"role": m["role"] if m["role"] in ("user", "assistant") else "user", "content": m["content"]}
            for m in messages
        ]

        payload: dict[str, Any] = {
            "model": target_model,
            "max_tokens": 4096,
            "messages": formatted_messages,
            "stream": True,
            "temperature": 0.2,
        }
        if system_prompt:
            payload["system"] = system_prompt

        endpoint = f"{self._base_url}/messages"
        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                async with client.stream("POST", endpoint, headers=self._get_headers(), json=payload) as response:
                    if response.status_code != 200:
                        err = await response.aread()
                        yield f"[Anthropic HTTP {response.status_code}]: {err.decode('utf-8', errors='ignore')[:200]}"
                        return

                    async for line in response.aiter_lines():
                        clean = line.strip()
                        if not clean or not clean.startswith("data:"):
                            continue
                        data_str = clean[5:].strip()
                        try:
                            event_data = json.loads(data_str)
                            event_type = event_data.get("type")
                            if event_type == "content_block_delta":
                                delta = event_data.get("delta", {})
                                if delta.get("type") == "text_delta":
                                    yield delta.get("text", "")
                            elif event_type == "message_stop":
                                break
                        except json.JSONDecodeError:
                            continue
        except Exception as e:
            yield f"[Error en llamada a Anthropic]: {str(e)}"

    async def generate_completion(
        self,
        model: str,
        prompt: str,
        system_prompt: str | None = None,
    ) -> str:
        """Generate full completion without streaming."""
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
        """Anthropic does not offer an embedding API directly."""
        logger.warning("Anthropic does not provide an embeddings endpoint. Returning empty vector.")
        return []

    async def get_installed_models(self) -> list[dict[str, Any]]:
        """Return standard Anthropic models."""
        return [
            {"name": "claude-3-5-sonnet-20241022", "model": "claude-3-5-sonnet-20241022"},
            {"name": "claude-3-5-haiku-20241022", "model": "claude-3-5-haiku-20241022"},
            {"name": "claude-3-opus-20240229", "model": "claude-3-opus-20240229"},
        ]

