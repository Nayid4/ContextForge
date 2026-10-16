"""Google Gemini Vector Embedding Strategy."""

from __future__ import annotations

import time
from typing import Any
from infrastructure.external.llm.gemini_client import GeminiHttpClient
from infrastructure.external.llm.strategies.options import EmbeddingOptions


class GeminiEmbeddingStrategy:
    """Embedding strategy for Google Gemini Embeddings (e.g. gemini-embedding-2)."""

    async def test_embedding(self, options: EmbeddingOptions) -> dict[str, Any]:
        t0 = time.perf_counter()
        prov = options.provider
        model_name = options.model or "gemini-embedding-2"
        try:
            client = GeminiHttpClient(
                api_key=options.api_key,
                base_url=options.base_url or "https://generativelanguage.googleapis.com/v1beta",
                default_model="gemini-2.5-flash",
            )
            vec = await client.generate_embedding(
                model=model_name,
                text=options.sample_text,
                task_type="search_query",
                output_dimensionality=options.dimensions or 768,
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
                "message": f"No se pudo generar el vector con '{model_name}'. Verifica tu API Key de Gemini.",
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

