"""GoF Observer Event Bus and deterministic zero-dependency fallback LLM provider."""

from __future__ import annotations

from contextforge.contracts import IKnowledgeObserver, ILLMProvider
from contextforge.models import KnowledgeEvent


class KnowledgeEventBus:
    """In-process GoF Observer dispatcher broadcasting :class:`KnowledgeEvent` records."""

    def __init__(self) -> None:
        self._observers: list[IKnowledgeObserver] = []

    def subscribe(self, observer: IKnowledgeObserver) -> None:
        if observer not in self._observers:
            self._observers.append(observer)

    def unsubscribe(self, observer: IKnowledgeObserver) -> None:
        if observer in self._observers:
            self._observers.remove(observer)

    def publish(self, event_type: str, payload: dict[str, object]) -> KnowledgeEvent:
        event = KnowledgeEvent(event_type=event_type, payload=payload)
        for observer in list(self._observers):
            observer.on_event(event)
        return event


class ExtractiveFallbackLLMProvider(ILLMProvider):
    """Deterministic local synthesizer used when no external LLM backend is injected.

    Guarantees that ``ContextForge.ask()`` works out of the box without API keys
    or external model servers while respecting exact source attribution.
    """

    @property
    def provider_name(self) -> str:
        return "extractive-local"

    def generate(self, prompt: str, *, system_prompt: str | None = None) -> str:
        lines = [line.strip() for line in prompt.splitlines() if line.strip()]
        context_lines = [line for line in lines if line.startswith("[") or not line.startswith("Question:")]
        excerpt = "\n".join(context_lines[:6]).strip()
        if not excerpt:
            return "No relevant knowledge fragments were found to answer this question."
        return f"Grounded synthesis from indexed knowledge base:\n{excerpt}"
