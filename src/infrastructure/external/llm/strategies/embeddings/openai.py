"""OpenAI Compatible Vector Embedding Strategy (Cloud, LM Studio, LocalAI)."""

from __future__ import annotations

import time
from typing import Any
from infrastructure.external.llm.openai_client import OpenAIHttpClient
from infrastructure.external.llm.strategies.options import EmbeddingOptions


class OpenAICompatibleEmbeddingStrategy:
    """Embedding strategy for OpenAI Cloud, LM Studio, and LocalAI."""

    async def test_embedding(self, options: EmbeddingOptions) -> dict[str, Any]:
        t0 = time.perf_counter()
        prov = options.provider
        is_cloud_openai = prov == "openai"
        default_url = (
            "https://api.openai.com/v1"
            if is_cloud_openai
            else ("http://localhost:1234/v1" if prov == "lm_studio" else "http://localhost:8080/v1")
        )
        model_name = options.model or "text-embedding-3-small"

        try:
            client = OpenAIHttpClient(
                api_key=options.api_key or "local-key",
                base_url=options.base_url or default_url,
                default_model=model_name,
                require_api_key=is_cloud_openai,
            )
            vec = await client.generate_embedding(
                model=model_name,
                text=options.sample_text,
            )
            latency_ms = round((time.perf_counter() - t0) * 1000.0, 2)
            if vec and len(vec) > 0:
                return {
                    "healthy": True,
                    "provider": prov,
                    "model": model_name,
                    "dimensions": len(vec),
                    "latency_ms": latency_ms,
                    "message": f"Embeddings generados exitosamente con {model_name} ({len(vec)} dimensiones, {latency_ms} ms)",
                }
            return {
                "healthy": False,
                "provider": prov,
                "model": model_name,
                "dimensions": 0,
                "latency_ms": latency_ms,
                "message": f"No se pudo generar el vector con '{model_name}'.",
            }
        except Exception as exc:
            latency_ms = round((time.perf_counter() - t0) * 1000.0, 2)
            return {
                "healthy": False,
                "provider": prov,
                "model": model_name,
                "dimensions": 0,
                "latency_ms": latency_ms,
                "message": f"Error al generar embedding ({prov}/{model_name}): {str(exc)}",
            }

