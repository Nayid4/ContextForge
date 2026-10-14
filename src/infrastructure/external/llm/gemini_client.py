"""Google Gemini HTTP Client Adapter for LLM inference."""

from __future__ import annotations

import logging
from typing import Any
from infrastructure.external.llm.openai_client import OpenAIHttpClient

logger = logging.getLogger("infrastructure.llm.gemini")


class GeminiHttpClient(OpenAIHttpClient):
    """Client for Google Gemini using Google's official OpenAI-compatible REST endpoint."""

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://generativelanguage.googleapis.com/v1beta/openai",
        default_model: str = "gemini-1.5-flash",
        timeout_seconds: float = 60.0,
    ) -> None:
        super().__init__(
            api_key=api_key,
            base_url=base_url,
            default_model=default_model,
            timeout_seconds=timeout_seconds,
        )

    async def get_installed_models(self) -> list[dict[str, Any]]:
        """Return popular Google Gemini models."""
        return [
            {"name": "gemini-1.5-flash", "model": "gemini-1.5-flash"},
            {"name": "gemini-1.5-pro", "model": "gemini-1.5-pro"},
            {"name": "gemini-2.0-flash-exp", "model": "gemini-2.0-flash-exp"},
        ]

