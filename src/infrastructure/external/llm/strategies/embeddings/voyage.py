"""Anthropic Voyage AI Vector Embedding Strategy."""

from __future__ import annotations

import time
from typing import Any
from infrastructure.external.llm.anthropic_client import AnthropicHttpClient
from infrastructure.external.llm.strategies.options import EmbeddingOptions


class AnthropicVoyageEmbeddingStrategy:
    """Embedding strategy for Voyage AI embeddings used alongside Anthropic."""

    async def test_embedding(self, options: EmbeddingOptions) -> dict[str, Any]:
        t0 = time.perf_counter()
        prov = options.provider
        model_name = options.model or "voyage-4"
        try:
            client = AnthropicHttpClient(
                api_key=options.api_key,
                voyage_api_key=options.api_key,
            )
            vec = await client.generate_embedding(
                model=model_name,
                text=options.sample_text,
                input_type="query",
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

