"""Local Ollama Vector Embedding Strategy."""

from __future__ import annotations

import time
from typing import Any
from infrastructure.external.llm.strategies.options import EmbeddingOptions
from infrastructure.external.ollama_client import OllamaHttpClient


class OllamaEmbeddingStrategy:
    """Embedding strategy for local Ollama models (e.g. nomic-embed-text, mxbai-embed-large)."""

    async def test_embedding(self, options: EmbeddingOptions) -> dict[str, Any]:
        t0 = time.perf_counter()
        prov = options.provider
        model_name = options.model or "nomic-embed-text"
        try:
            client = OllamaHttpClient(base_url=options.base_url or "http://localhost:11434")
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
                "message": f"No se pudo generar el vector con '{model_name}' en Ollama.",
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

