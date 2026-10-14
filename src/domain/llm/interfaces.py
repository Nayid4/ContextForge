"""LLM Client and Strategy Domain Interfaces."""

from __future__ import annotations

from typing import Any, AsyncGenerator, Protocol


class ILLMClient(Protocol):
    """Protocol for unified LLM Client adapters (Ollama, OpenAI, Anthropic, DeepSeek, Gemini)."""

    async def test_connection(self) -> tuple[bool, str, float]:
        """Test provider endpoint connectivity and return (is_healthy, message, latency_ms)."""
        ...

    def stream_chat(
        self,
        model: str,
        messages: list[dict[str, str]],
        system_prompt: str | None = None,
    ) -> AsyncGenerator[str, None]:
        """Stream chat completion tokens asynchronously."""
        ...

    async def generate_completion(
        self,
        model: str,
        prompt: str,
        system_prompt: str | None = None,
    ) -> str:
        """Generate non-streaming text completion."""
        ...

    async def generate(
        self,
        prompt: str,
        system: str | None = None,
        model: str | None = None,
    ) -> str:
        """High-level generation method compatible with ScopedChatService and Scaffolding."""
        ...

    async def generate_embedding(self, model: str, text: str) -> list[float]:
        """Generate dense vector embedding for semantic search."""
        ...

    async def get_installed_models(self) -> list[dict[str, Any]]:
        """Return available or supported models for this provider."""
        ...

