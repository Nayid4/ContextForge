"""Ollama HTTP Client for Sovereign Local LLM Ingest and Inference."""

from __future__ import annotations

import json
import logging
import time
from typing import Any, AsyncGenerator
import httpx
from domain.rag_engine.repositories import IOllamaClient

logger = logging.getLogger("infrastructure.ollama")


class OllamaHttpClient(IOllamaClient):
    """Client for local Ollama API running on localhost:11434."""

    def __init__(self, base_url: str = "http://localhost:11434", timeout_seconds: float = 60.0) -> None:
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout_seconds

    async def test_connection(self) -> tuple[bool, str, float]:
        """Test local Ollama daemon connectivity and calculate latency."""
        t0 = time.perf_counter()
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(f"{self._base_url}/api/version")
                latency_ms = (time.perf_counter() - t0) * 1000.0
                if res.status_code == 200:
                    version_info = res.json().get("version", "desconocida")
                    return True, f"Daemon Ollama operativo (v{version_info})", round(latency_ms, 1)
                return False, f"Ollama HTTP {res.status_code}", round(latency_ms, 1)
        except Exception as e:
            latency_ms = (time.perf_counter() - t0) * 1000.0
            return False, f"Ollama inaccesible en {self._base_url}: {str(e)}", round(latency_ms, 1)

    async def get_installed_models(self) -> list[dict[str, Any]]:
        """Fetch list of locally installed Ollama models via /api/tags."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(f"{self._base_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    models = data.get("models", [])
                    output: list[dict[str, Any]] = []
                    for m in models:
                        details = m.get("details", {})
                        output.append({
                            "name": m.get("name", ""),
                            "model": m.get("model", ""),
                            "size_bytes": m.get("size", 0),
                            "parameter_size": details.get("parameter_size", "Desconocido"),
                            "quantization_level": details.get("quantization_level", "N/A"),
                            "format": details.get("format", "gguf"),
                            "modified_at": m.get("modified_at", ""),
                        })
                    return output
                return []
        except Exception as e:
            logger.warning("Could not reach Ollama at %s: %s", self._base_url, e)
            return []

    async def stream_chat(
        self,
        model: str,
        messages: list[dict[str, str]],
        system_prompt: str | None = None,
    ) -> AsyncGenerator[str, None]:
        """Stream response tokens from Ollama chat API."""
        formatted_messages = []
        if system_prompt:
            formatted_messages.append({"role": "system", "content": system_prompt})
        formatted_messages.extend(messages)

        payload = {
            "model": model,
            "messages": formatted_messages,
            "stream": True,
            "options": {"temperature": 0.2},
        }

        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                async with client.stream(
                    "POST",
                    f"{self._base_url}/api/chat",
                    json=payload,
                ) as response:
                    if response.status_code != 200:
                        yield f"[Error Ollama HTTP {response.status_code}]: No se pudo generar respuesta con el modelo {model}."
                        return

                    async for line in response.aiter_lines():
                        if not line.strip():
                            continue
                        try:
                            chunk_data = json.loads(line)
                            msg = chunk_data.get("message", {})
                            content = msg.get("content", "")
                            if content:
                                yield content
                        except json.JSONDecodeError:
                            continue
        except httpx.ConnectError:
            yield f"[Ollama Desconectado]: No se pudo conectar al servicio local de Ollama en {self._base_url}. Asegúrate de que el proceso esté iniciado."
        except Exception as e:
            yield f"[Error de Inferencia]: {str(e)}"

    async def generate_completion(
        self,
        model: str,
        prompt: str,
        system_prompt: str | None = None,
    ) -> str:
        """Generate full completion without streaming tokens."""
        messages = [{"role": "user", "content": prompt}]
        tokens: list[str] = []
        async for token in self.stream_chat(model=model, messages=messages, system_prompt=system_prompt):
            tokens.append(token)
        return "".join(tokens)

    async def generate(
        self,
        prompt: str,
        system: str | None = None,
        model: str | None = None,
    ) -> str:
        """Convenience method to generate full completion using the active or default model."""
        target_model = model or "llama3.1:8b"
        return await self.generate_completion(model=target_model, prompt=prompt, system_prompt=system)


    async def generate_embedding(self, model: str, text: str) -> list[float]:
        """Generate embedding vector using local model."""
        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                res = await client.post(
                    f"{self._base_url}/api/embeddings",
                    json={"model": model, "prompt": text},
                )
                if res.status_code == 200:
                    data = res.json()
                    return list(data.get("embedding", []))
                return []
        except Exception as e:
            logger.warning("Embedding error in Ollama: %s", e)
            return []

