"""Anthropic (Claude) & Voyage AI Embeddings HTTP Client Adapter for LLM inference."""

from __future__ import annotations

import json
import logging
import os
import time
from typing import Any, AsyncGenerator
import httpx
from domain.llm.entities import is_masked_api_key, sanitize_api_key
from domain.llm.interfaces import ILLMClient

logger = logging.getLogger("infrastructure.llm.anthropic")


class AnthropicHttpClient(ILLMClient):
    """Client for Anthropic Claude Messages API + Voyage AI Embeddings (official Anthropic partner)."""

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.anthropic.com/v1",
        default_model: str = "claude-sonnet-4-5",
        timeout_seconds: float = 60.0,
        voyage_api_key: str = "",
    ) -> None:
        self._raw_key_was_masked = bool(api_key and is_masked_api_key(api_key))
        self._api_key = sanitize_api_key(api_key)
        raw_url = (base_url or "https://api.anthropic.com/v1").strip().rstrip("/")
        if raw_url == "https://api.anthropic.com":
            raw_url = "https://api.anthropic.com/v1"
        self._base_url = raw_url
        self._default_model = default_model or "claude-sonnet-4-5"
        self._timeout = timeout_seconds
        self._voyage_api_key = sanitize_api_key(voyage_api_key or os.environ.get("VOYAGE_API_KEY", ""))

    def _get_headers(self) -> dict[str, str]:
        return {
            "Content-Type": "application/json",
            "x-api-key": self._api_key,
            "anthropic-version": "2023-06-01",
        }

    async def test_connection(self) -> tuple[bool, str, float]:
        """Test Anthropic API key via GET /v1/models (zero-token check) with fallback to /v1/messages."""
        if not self._api_key:
            if self._raw_key_was_masked:
                return (
                    False,
                    "La API Key de Anthropic mostrada está oculta por seguridad. Haz clic en 'Cambiar' y pega tu clave real.",
                    0.0,
                )
            return False, "API Key de Anthropic (Claude) no configurada.", 0.0

        t0 = time.perf_counter()
        models_endpoint = f"{self._base_url}/models"
        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                try:
                    models_res = await client.get(models_endpoint, headers=self._get_headers())
                    latency_ms = round((time.perf_counter() - t0) * 1000.0, 2)
                    if models_res.status_code == 200:
                        data = models_res.json()
                        count = len(data.get("data", []))
                        return (
                            True,
                            f"Conectado a Anthropic Claude Platform ({count} modelos disponibles, activo: {self._default_model})",
                            latency_ms,
                        )
                except Exception:
                    pass

                # Fallback to 1-token messages probe (supported by all Anthropic proxies and mocks)
                msg_endpoint = f"{self._base_url}/messages"
                payload = {
                    "model": "claude-3-5-haiku-20241022",
                    "max_tokens": 1,
                    "messages": [{"role": "user", "content": "ping"}],
                }
                res = await client.post(msg_endpoint, headers=self._get_headers(), json=payload)
                latency_ms = round((time.perf_counter() - t0) * 1000.0, 2)
                if res.status_code == 200:
                    return True, "Conexión con Anthropic Claude exitosa", latency_ms
                if res.status_code in (401, 403):
                    return False, "Error 401: API Key de Anthropic inválida o revocada.", latency_ms

                err_data = res.json() if res.headers.get("content-type", "").startswith("application/json") else {}
                msg = err_data.get("error", {}).get("message", res.text[:120])
                return False, f"Anthropic HTTP {res.status_code}: {msg}", latency_ms
        except Exception as e:
            latency_ms = round((time.perf_counter() - t0) * 1000.0, 2)
            return False, f"Error de conexión con Anthropic: {str(e)}", latency_ms

    async def stream_chat(
        self,
        model: str,
        messages: list[dict[str, str]],
        system_prompt: str | None = None,
    ) -> AsyncGenerator[str, None]:
        """Stream Claude responses via Anthropic Messages SSE API."""
        m = (model or "").strip()
        target_model = m if (m and "claude" in m.lower()) else (self._default_model if "claude" in self._default_model.lower() else "claude-3-5-sonnet-latest")
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

    async def generate_embedding(
        self,
        model: str,
        text: str,
        input_type: str = "query",
    ) -> list[float]:
        """Generate embeddings via Voyage AI (Anthropic's official embeddings partner) or MongoDB Atlas AI API."""
        effective_voyage_key = self._voyage_api_key or (
            self._api_key if self._api_key.startswith("pa-") or self._api_key.startswith("al-") else ""
        )
        if not effective_voyage_key:
            logger.info("Voyage API key not configured for Anthropic embeddings; falling back to local vector store.")
            return []

        voyage_model = model if model and model.startswith("voyage-") else "voyage-4"
        endpoints = [
            "https://ai.mongodb.com/v1/embeddings",
            "https://api.voyageai.com/v1/embeddings",
        ]
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {effective_voyage_key}",
        }
        payload: dict[str, Any] = {
            "input": [text],
            "model": voyage_model,
            "input_type": input_type if input_type in ("query", "document") else "query",
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            for endpoint in endpoints:
                try:
                    res = await client.post(endpoint, headers=headers, json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        items = data.get("data", [])
                        if items and isinstance(items[0], dict):
                            emb: list[float] = items[0].get("embedding", [])
                            return emb
                except Exception as exc:
                    logger.debug("Voyage endpoint %s failed: %s", endpoint, exc)
        return []

    async def get_installed_models(self) -> list[dict[str, Any]]:
        """Return official Anthropic Claude models."""
        return [
            {"name": "claude-sonnet-4-5", "model": "claude-sonnet-4-5"},
            {"name": "claude-3-7-sonnet-latest", "model": "claude-3-7-sonnet-latest"},
            {"name": "claude-3-5-sonnet-20241022", "model": "claude-3-5-sonnet-20241022"},
            {"name": "claude-3-5-haiku-20241022", "model": "claude-3-5-haiku-20241022"},
        ]
