"""Zero-network deterministic extractive synthesizer guaranteeing continuity (BR-12, RIC-06)."""

from __future__ import annotations

import re
from typing import AsyncIterator

from domain.rag import ILLMProviderPort


class ExtractiveFallbackAdapter(ILLMProviderPort):
    @property
    def provider_name(self) -> str:
        return "extractive_fallback"

    @property
    def engine_type(self) -> str:
        return "extractive_fallback"

    @property
    def base_url(self) -> str:
        return "local://extractive"

    async def generate(self, prompt: str, *, system_prompt: str | None = None, model: str | None = None) -> str:
        matches = re.findall(
            r"<context_chunk[^>]*source='([^']+)'[^>]*title='([^']+)'[^>]*section='[^']*'>\n(.*?)\n</context_chunk>",
            prompt,
            re.DOTALL,
        )
        if not matches:
            return "Síntesis local extractiva: consulte las referencias adjuntas del proyecto."
        bullets = ["Síntesis fundamentada en la documentación certificada del proyecto:"]
        for src, title, body in matches[:3]:
            snippet = " ".join(body.strip().splitlines())[:260]
            bullets.append(f"- **[{src}] ({title}):** {snippet}")
        return "\n".join(bullets)

    async def stream_generate(self, prompt: str, *, system_prompt: str | None = None, model: str | None = None) -> AsyncIterator[str]:
        full = await self.generate(prompt, system_prompt=system_prompt, model=model)
        for token in full.split(" "):
            yield token + " "

    async def check_health(self) -> tuple[bool, str, float]:
        return True, "Motor extractivo determinista local operativo.", 0.1
