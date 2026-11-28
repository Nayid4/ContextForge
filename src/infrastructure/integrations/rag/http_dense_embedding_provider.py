"""Real dense semantic embedding provider supporting Ollama (/api/embed) and OpenAI-compatible (/v1/embeddings) APIs."""

from __future__ import annotations

import math
from typing import Sequence
import httpx

from domain.rag import IEmbeddingProviderPort, SovereignRoutingPolicy
from domain.users import DlpRedactionStrategy


class HttpDenseEmbeddingProvider(IEmbeddingProviderPort):
    """Generates L2-normalized dense neural embeddings via Ollama or OpenAI-compatible HTTP endpoints with BR-21 egress & DLP guards."""

    def __init__(
        self,
        *,
        provider: str = "ollama",
        base_url: str = "http://127.0.0.1:11434",
        model: str = "nomic-embed-text",
        api_key: str = "",
        timeout_sec: float = 12.0,
        sovereign_only: bool = False,
        enable_dlp: bool = True,
    ) -> None:
        self._provider = provider.strip().lower() or "ollama"
        self._base_url = base_url.rstrip("/")
        self._model = model.strip() or "nomic-embed-text"
        self._api_key = api_key.strip()
        self._timeout = timeout_sec
        self._sovereign_only = sovereign_only
        self._enable_dlp = enable_dlp

    @property
    def provider_name(self) -> str:
        return self._provider

    @property
    def model_name(self) -> str:
        return self._model

    @property
    def engine_type(self) -> str:
        return "local_http" if self._provider == "ollama" else "cloud_api"

    @property
    def base_url(self) -> str:
        return self._base_url

    @staticmethod
    def _normalize(vec: list[float]) -> list[float]:
        norm = math.sqrt(sum(v * v for v in vec)) or 1.0
        return [v / norm for v in vec]

    async def embed_texts(
        self,
        texts: Sequence[str],
        *,
        sovereign_only: bool | None = None,
        enable_dlp: bool | None = None,
    ) -> list[list[float]]:
        clean_texts = [t if t.strip() else " " for t in texts]
        if not clean_texts:
            return []
        eff_sov = self._sovereign_only if sovereign_only is None else sovereign_only
        sov_chk = SovereignRoutingPolicy.check_provider_allowed(
            project_sovereign_only=eff_sov,
            provider_engine_type=self.engine_type,
            base_url=self._base_url,
            provider_name=self._provider,
        )
        if sov_chk.is_error:
            raise PermissionError(sov_chk.first_error.message)

        eff_dlp = self._enable_dlp if enable_dlp is None else enable_dlp
        if SovereignRoutingPolicy.requires_dlp(
            dlp_enabled=eff_dlp,
            provider_engine_type=self.engine_type,
            base_url=self._base_url,
            provider_name=self._provider,
        ):
            clean_texts = [DlpRedactionStrategy.redact(t, redact_emails=True)[0] for t in clean_texts]

        async with httpx.AsyncClient(timeout=self._timeout) as client:
            if self._provider == "ollama":
                url = f"{self._base_url or 'http://127.0.0.1:11434'}/api/embed"
                resp = await client.post(url, json={"model": self._model, "input": clean_texts})
                resp.raise_for_status()
                raw_vecs = resp.json().get("embeddings") or []
                return [self._normalize([float(x) for x in v]) for v in raw_vecs]

            url = f"{self._base_url or 'https://api.openai.com/v1'}/embeddings"
            headers = {"Content-Type": "application/json"}
            if self._api_key:
                headers["Authorization"] = f"Bearer {self._api_key}"
            resp = await client.post(url, headers=headers, json={"model": self._model, "input": clean_texts})
            resp.raise_for_status()
            items = sorted(resp.json().get("data") or [], key=lambda d: int(d.get("index", 0)))
            return [self._normalize([float(x) for x in item["embedding"]]) for item in items]
