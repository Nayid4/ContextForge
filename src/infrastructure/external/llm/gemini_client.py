"""Native Google Gemini REST API Adapter (AI Studio / v1beta Models, Interactions & Embeddings)."""

from __future__ import annotations

import json
import logging
import math
import time
from typing import Any, AsyncGenerator
import httpx
from domain.llm.entities import is_masked_api_key, sanitize_api_key
from domain.llm.interfaces import ILLMClient

logger = logging.getLogger("infrastructure.llm.gemini")


def normalize_gemini_base_url(base_url: str | None) -> str:
    """Normalize any Google AI Studio / Gemini endpoint URL to the canonical /v1beta root."""
    raw = (base_url or "https://generativelanguage.googleapis.com/v1beta").strip().rstrip("/")
    for suffix in ("/interactions/models", "/interactions", "/openai/models", "/openai", "/models"):
        if raw.endswith(suffix):
            raw = raw[: -len(suffix)].rstrip("/")
    if raw == "https://generativelanguage.googleapis.com":
        raw = "https://generativelanguage.googleapis.com/v1beta"
    if not raw.endswith("/v1beta") and "generativelanguage.googleapis.com" in raw and "/v1" not in raw:
        raw = f"{raw}/v1beta"
    return raw


class GeminiHttpClient(ILLMClient):
    """Official Google Gemini REST Client supporting v1beta/models, v1beta/interactions & Gemini Embeddings 2."""

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://generativelanguage.googleapis.com/v1beta",
        default_model: str = "gemini-2.5-flash",
        timeout_seconds: float = 60.0,
    ) -> None:
        self._raw_key_was_masked = bool(api_key and is_masked_api_key(api_key))
        self._api_key = sanitize_api_key(api_key)
        self._raw_base_url = (base_url or "https://generativelanguage.googleapis.com/v1beta").strip()
        self._prefer_interactions = "/interactions" in self._raw_base_url
        self._base_url = normalize_gemini_base_url(self._raw_base_url)
        self._default_model = (default_model or "gemini-2.5-flash").strip()
        self._timeout = timeout_seconds

    @property
    def base_url(self) -> str:
        """Normalized Gemini API root URL (https://generativelanguage.googleapis.com/v1beta)."""
        return self._base_url

    def _get_headers(self) -> dict[str, str]:
        """Build pure-ASCII headers with Google's official x-goog-api-key header."""
        headers: dict[str, str] = {
            "Content-Type": "application/json",
        }
        if self._api_key:
            headers["x-goog-api-key"] = self._api_key
        return headers

    def _clean_model_id(self, model: str | None) -> str:
        m = (model or "").strip()
        if m.startswith("models/"):
            m = m[len("models/") :]
        # If model name belongs to another provider (e.g. llama3.1:8b, gpt-4o, claude-3-5, deepseek)
        # or does not start with 'gemini', safely fall back to configured default or gemini-2.5-flash
        if not m or not m.lower().startswith("gemini"):
            def_m = (self._default_model or "").strip()
            if def_m.startswith("models/"):
                def_m = def_m[len("models/") :]
            if def_m and def_m.lower().startswith("gemini"):
                m = def_m
            else:
                m = "gemini-2.5-flash"
        return m

    async def test_connection(self) -> tuple[bool, str, float]:
        """Verify Gemini API key against GET /v1beta/models using x-goog-api-key header."""
        if not self._api_key:
            if self._raw_key_was_masked:
                return (
                    False,
                    "La API Key de Gemini mostrada está oculta por seguridad (••••) y no hay una clave válida guardada. Haz clic en 'Cambiar', pega tu GEMINI_API_KEY de Google AI Studio y vuelve a probar.",
                    0.0,
                )
            return (
                False,
                "API Key de Google Gemini vacía. Obtén tu clave en https://aistudio.google.com/api-keys y pégala aquí.",
                0.0,
            )

        start = time.perf_counter()
        url = f"{self._base_url}/models"
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(
                    url,
                    headers=self._get_headers(),
                    params={"pageSize": 25},
                )
                latency = round((time.perf_counter() - start) * 1000, 2)

                if response.status_code == 200:
                    data = response.json()
                    models_list = data.get("models", [])
                    count = len(models_list) if isinstance(models_list, list) else 0
                    return (
                        True,
                        f"Conectado a Google Gemini API ({count}+ modelos disponibles en /v1beta/models, modelo activo: {self._default_model})",
                        latency,
                    )
                if response.status_code in (400, 401, 403):
                    try:
                        err_detail = response.json().get("error", {}).get("message", "")
                    except Exception:
                        err_detail = ""
                    msg = f"API Key de Gemini inválida o sin permisos (HTTP {response.status_code})"
                    if err_detail:
                        msg = f"{msg}: {err_detail}"
                    return False, msg, latency
                if response.status_code == 429:
                    return False, "Límite de cuota (Rate Limit 429) alcanzado en Google AI Studio.", latency
                return False, f"Error HTTP {response.status_code}: {response.text[:160]}", latency
        except Exception as exc:
            latency = round((time.perf_counter() - start) * 1000, 2)
            return False, f"Error de red al conectar con Google Gemini: {str(exc)}", latency

    async def generate(
        self,
        prompt: str,
        system: str | None = None,
        model: str | None = None,
    ) -> str:
        """Generate completion using Gemini generateContent or Interactions API."""
        return await self.generate_completion(
            model=model or self._default_model,
            prompt=prompt,
            system_prompt=system,
        )

    async def generate_completion(
        self,
        model: str,
        prompt: str,
        system_prompt: str | None = None,
    ) -> str:
        """Execute non-streaming generation against Gemini REST API with automatic model fallback."""
        model_id = self._clean_model_id(model)

        async with httpx.AsyncClient(timeout=self._timeout) as client:
            # 1. If user explicitly configured /v1beta/interactions, try Interactions API first
            if self._prefer_interactions:
                interactions_url = f"{self._base_url}/interactions"
                interactions_payload: dict[str, Any] = {
                    "model": model_id,
                    "input": f"{system_prompt}\n\n{prompt}" if system_prompt else prompt,
                }
                inter_res = await client.post(
                    interactions_url,
                    headers=self._get_headers(),
                    json=interactions_payload,
                )
                if inter_res.status_code == 200:
                    data = inter_res.json()
                    if "output_text" in data and isinstance(data["output_text"], str):
                        return data["output_text"]
                    steps = data.get("steps", [])
                    for step in steps:
                        for block in step.get("content", []):
                            if block.get("type") == "text" and block.get("text"):
                                return str(block["text"])

            # 2. Standard /v1beta/models/{model}:generateContent endpoint
            candidate_models = [model_id]
            for fallback in ("gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"):
                if fallback not in candidate_models:
                    candidate_models.append(fallback)

            payload: dict[str, Any] = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": prompt}],
                    }
                ],
                "generationConfig": {
                    "temperature": 0.2,
                },
            }
            if system_prompt:
                payload["systemInstruction"] = {
                    "parts": [{"text": system_prompt}],
                }

            last_response: httpx.Response | None = None
            for candidate in candidate_models:
                url = f"{self._base_url}/models/{candidate}:generateContent"
                response = await client.post(url, headers=self._get_headers(), json=payload)
                last_response = response
                if response.status_code == 200:
                    data = response.json()
                    return self._extract_text_from_generate_content(data)
                if response.status_code != 404:
                    break

            if last_response is not None and last_response.status_code != 200:
                err_detail = ""
                try:
                    err_json = last_response.json()
                    err_obj = err_json.get("error", {})
                    err_detail = err_obj.get("message", "")
                except Exception:
                    err_detail = last_response.text[:200]

                logger.error(
                    "Google Gemini API error (%d) for model %s: %s",
                    last_response.status_code,
                    model_id,
                    err_detail,
                )
                if "API key not valid" in err_detail or last_response.status_code in (400, 401, 403):
                    return (
                        f"⚠️ **Error de Autenticación con Google Gemini (HTTP {last_response.status_code})**: "
                        f"{err_detail or 'La API Key configurada no es válida en Google AI Studio.'}\n\n"
                        f"👉 **Solución**: Ve a **Configuración -> Motores de IA**, introduce tu `GEMINI_API_KEY` "
                        f"obtenida en [Google AI Studio](https://aistudio.google.com/api-keys) y haz clic en Guardar y Probar Conexión."
                    )
                if last_response.status_code == 429:
                    return (
                        f"⚠️ **Límite de Cuota en Google Gemini (HTTP 429)**: Se ha superado la cuota de peticiones "
                        f"en Google AI Studio para el modelo `{model_id}`. Espera unos segundos o usa otro motor."
                    )
                return f"⚠️ **Error en Google Gemini ({model_id}) [HTTP {last_response.status_code}]**: {err_detail}"
            return ""

    @staticmethod
    def _extract_text_from_generate_content(data: dict[str, Any]) -> str:
        candidates = data.get("candidates", [])
        if not candidates:
            return ""
        content = candidates[0].get("content", {})
        parts = content.get("parts", [])
        texts = [str(p.get("text", "")) for p in parts if isinstance(p, dict) and "text" in p]
        return "".join(texts)

    async def stream_generate(
        self,
        prompt: str,
        system: str | None = None,
        model: str | None = None,
    ) -> AsyncGenerator[str, None]:
        """Stream completion chunks from Gemini."""
        messages = [{"role": "user", "content": prompt}]
        async for chunk in self.stream_chat(
            model=model or self._default_model,
            messages=messages,
            system_prompt=system,
        ):
            yield chunk

    async def stream_chat(
        self,
        model: str,
        messages: list[dict[str, str]],
        system_prompt: str | None = None,
    ) -> AsyncGenerator[str, None]:
        """Stream tokens using Gemini :streamGenerateContent?alt=sse endpoint."""
        model_id = self._clean_model_id(model)
        contents: list[dict[str, Any]] = []
        extracted_sys = system_prompt

        for msg in messages:
            role = msg.get("role", "user")
            text = msg.get("content", "")
            if role == "system":
                extracted_sys = f"{extracted_sys}\n{text}" if extracted_sys else text
                continue
            gemini_role = "model" if role == "assistant" else "user"
            contents.append({"role": gemini_role, "parts": [{"text": text}]})

        if not contents:
            contents = [{"role": "user", "parts": [{"text": "Hola"}]}]

        payload: dict[str, Any] = {
            "contents": contents,
            "generationConfig": {"temperature": 0.2},
        }
        if extracted_sys:
            payload["systemInstruction"] = {"parts": [{"text": extracted_sys}]}

        url = f"{self._base_url}/models/{model_id}:streamGenerateContent?alt=sse"
        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                async with client.stream(
                    "POST",
                    url,
                    headers=self._get_headers(),
                    json=payload,
                ) as response:
                    if response.status_code in (400, 404) and model_id != "gemini-2.5-flash":
                        fallback_url = f"{self._base_url}/models/gemini-2.5-flash:streamGenerateContent?alt=sse"
                        async with client.stream(
                            "POST",
                            fallback_url,
                            headers=self._get_headers(),
                            json=payload,
                        ) as fb_res:
                            if fb_res.status_code == 200:
                                async for line in fb_res.aiter_lines():
                                    chunk_txt = self._parse_sse_line(line)
                                    if chunk_txt:
                                        yield chunk_txt
                                return

                    if response.status_code != 200:
                        err_bytes = await response.aread()
                        err_detail = ""
                        try:
                            err_json = json.loads(err_bytes.decode("utf-8"))
                            err_detail = err_json.get("error", {}).get("message", "")
                        except Exception:
                            err_detail = err_bytes.decode("utf-8", errors="ignore")[:200]

                        logger.error(
                            "Google Gemini stream error (%d) for model %s: %s",
                            response.status_code,
                            model_id,
                            err_detail,
                        )
                        if "API key not valid" in err_detail or response.status_code in (400, 401, 403):
                            yield (
                                f"\n\n⚠️ **Error de Autenticación con Google Gemini (HTTP {response.status_code})**: "
                                f"{err_detail or 'La API Key configurada no es válida en Google AI Studio.'}\n\n"
                                f"👉 **Solución**: Ve a **Configuración -> Motores de IA**, introduce tu `GEMINI_API_KEY` "
                                f"obtenida en [Google AI Studio](https://aistudio.google.com/api-keys) y haz clic en Guardar y Probar Conexión."
                            )
                        elif response.status_code == 429:
                            yield (
                                f"\n\n⚠️ **Límite de Cuota en Google Gemini (HTTP 429)**: Se ha superado la cuota "
                                f"en Google AI Studio para `{model_id}`. Espera unos segundos o usa otro motor."
                            )
                        else:
                            yield f"\n\n⚠️ **Error en Google Gemini ({model_id}) [HTTP {response.status_code}]**: {err_detail}"
                        return

                    async for line in response.aiter_lines():
                        chunk_txt = self._parse_sse_line(line)
                        if chunk_txt:
                            yield chunk_txt
        except Exception as exc:
            logger.error("Error in Gemini stream_chat (%s): %s", model_id, exc)
            yield f"\n\n⚠️ *Error al conectar con Google Gemini ({model_id}): {str(exc)}*"

    def _parse_sse_line(self, line: str) -> str:
        if not line or not line.startswith("data: "):
            return ""
        data_str = line[6:].strip()
        if not data_str or data_str == "[DONE]":
            return ""
        try:
            chunk = json.loads(data_str)
            return self._extract_text_from_generate_content(chunk)
        except json.JSONDecodeError:
            return ""

    async def generate_embedding(
        self,
        model: str,
        text: str,
        task_type: str = "search_query",
        title: str | None = None,
        output_dimensionality: int = 768,
    ) -> list[float]:
        """Generate vector embeddings using gemini-embedding-2 or gemini-embedding-001.

        Follows Google AI Studio Embeddings 2 specification:
        - For gemini-embedding-2: formats text with task instruction prefix
          (`task: search result | query: ...` or `title: ... | text: ...`) and omits taskType parameter.
        - For gemini-embedding-001: uses `taskType` parameter and normalizes truncated MRL vectors.
        """
        if not self._api_key:
            return []

        embed_model = self._clean_model_id(model or "gemini-embedding-2")
        if not embed_model.startswith("gemini-embedding"):
            embed_model = "gemini-embedding-2"

        is_v2 = "gemini-embedding-2" in embed_model
        formatted_text = text
        if is_v2:
            if not text.startswith("task:") and not text.startswith("title:"):
                if task_type in ("document", "RETRIEVAL_DOCUMENT"):
                    doc_title = title or "none"
                    formatted_text = f"title: {doc_title} | text: {text}"
                elif task_type in ("code_query", "CODE_RETRIEVAL_QUERY"):
                    formatted_text = f"task: code retrieval | query: {text}"
                elif task_type in ("question_answering", "QUESTION_ANSWERING"):
                    formatted_text = f"task: question answering | query: {text}"
                else:
                    formatted_text = f"task: search result | query: {text}"

        payload: dict[str, Any] = {
            "model": f"models/{embed_model}",
            "content": {
                "parts": [{"text": formatted_text}],
            },
        }
        if output_dimensionality and output_dimensionality > 0:
            payload["outputDimensionality"] = output_dimensionality

        if not is_v2:
            api_task = (
                "RETRIEVAL_DOCUMENT"
                if task_type in ("document", "RETRIEVAL_DOCUMENT")
                else "RETRIEVAL_QUERY"
            )
            payload["taskType"] = api_task

        url = f"{self._base_url}/models/{embed_model}:embedContent"
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.post(url, headers=self._get_headers(), json=payload)
                if response.status_code == 404 and embed_model != "gemini-embedding-001":
                    # Fallback to gemini-embedding-001 if gemini-embedding-2 is not enabled on account
                    fb_url = f"{self._base_url}/models/gemini-embedding-001:embedContent"
                    fb_payload: dict[str, Any] = {
                        "model": "models/gemini-embedding-001",
                        "content": {"parts": [{"text": text}]},
                        "taskType": "RETRIEVAL_QUERY",
                    }
                    if output_dimensionality and output_dimensionality > 0:
                        fb_payload["outputDimensionality"] = output_dimensionality
                    response = await client.post(fb_url, headers=self._get_headers(), json=fb_payload)
                    is_v2 = False

                response.raise_for_status()
                data = response.json()
                values: list[float] = data.get("embedding", {}).get("values", [])
                if not values:
                    return []
                # Manual normalization for gemini-embedding-001 on non-3072 dimensions per Google docs
                if not is_v2 and len(values) != 3072:
                    norm = math.sqrt(sum(v * v for v in values))
                    if norm > 0:
                        values = [v / norm for v in values]
                return values
        except Exception as exc:
            logger.warning("Gemini embedding error (%s): %s", embed_model, exc)
            return []

    async def get_installed_models(self) -> list[dict[str, Any]]:
        """Return official Google Gemini models."""
        return [
            {"name": "gemini-2.5-flash", "model": "gemini-2.5-flash"},
            {"name": "gemini-3.8-flash", "model": "gemini-3.8-flash"},
            {"name": "gemini-2.5-pro", "model": "gemini-2.5-pro"},
            {"name": "gemini-2.0-flash", "model": "gemini-2.0-flash"},
            {"name": "gemini-1.5-flash", "model": "gemini-1.5-flash"},
            {"name": "gemini-1.5-pro", "model": "gemini-1.5-pro"},
            {"name": "gemini-3.1-pro-preview", "model": "gemini-3.1-pro-preview"},
        ]
