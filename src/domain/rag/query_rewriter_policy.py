"""Multi-turn conversation history formatter & follow-up query rewriter (pure domain, ignores client system prompts)."""

from __future__ import annotations

import re
from typing import Sequence


class QueryRewriterPolicy:
    """Rewrites follow-up questions using recent user/assistant turns while strictly ignoring client 'system' turns."""

    _FOLLOWUP_MARKERS: tuple[str, ...] = (
        "eso",
        "esa",
        "ese",
        "esos",
        "esas",
        "esto",
        "esta",
        "ello",
        "ellos",
        "ellas",
        "lo mismo",
        "mas detalle",
        "más detalle",
        "detalla",
        "amplia",
        "amplía",
        "profundiza",
        "explica mejor",
        "y que",
        "y qué",
        "y cual",
        "y cuál",
        "y como",
        "y cómo",
        "what about",
        "tell me more",
        "more details",
        "explain that",
        "and it",
        "how does it",
        "why does it",
    )

    _WORD_RE = re.compile(r"[A-Za-zÁÉÍÓÚáéíóúÑñ0-9_-]{4,}")

    @classmethod
    def sanitize_history(cls, history: Sequence[tuple[str, str]] | None, max_turns: int = 4) -> tuple[tuple[str, str], ...]:
        """Drops any 'system' role entries so callers can never override agent system_prompt or topic_boundaries."""
        if not history:
            return ()
        cleaned = [
            (role.strip().lower(), content.strip())
            for role, content in history
            if role.strip().lower() in ("user", "assistant") and content.strip()
        ]
        return tuple(cleaned[-(max_turns * 2) :])

    @classmethod
    def is_followup(cls, question: str) -> bool:
        q = question.strip().lower()
        words = q.split()
        if len(words) <= 5:
            return True
        return any(marker in q for marker in cls._FOLLOWUP_MARKERS)

    @classmethod
    def rewrite_with_history(cls, question: str, history: Sequence[tuple[str, str]] | None) -> str:
        """Expands follow-up queries with anchor keywords from the previous user turn for accurate RAG retrieval."""
        q = question.strip()
        safe_hist = cls.sanitize_history(history)
        if not safe_hist or not cls.is_followup(q):
            return q
        prev_user_turns = [content for role, content in safe_hist if role == "user"]
        if not prev_user_turns:
            return q
        anchor = prev_user_turns[-1]
        existing = {w.lower() for w in cls._WORD_RE.findall(q)}
        anchor_terms: list[str] = []
        for token in cls._WORD_RE.findall(anchor):
            low = token.lower()
            if low not in existing and low not in anchor_terms:
                anchor_terms.append(token)
            if len(anchor_terms) >= 8:
                break
        if not anchor_terms:
            return q
        return f"{q} {' '.join(anchor_terms)}"

    @classmethod
    def format_conversation_history(cls, history: Sequence[tuple[str, str]] | None, max_turns: int = 4) -> str:
        safe_hist = cls.sanitize_history(history, max_turns=max_turns)
        if not safe_hist:
            return ""
        lines = [f"{role.upper()}: {content[:500]}" for role, content in safe_hist]
        return "<conversation_history>\n" + "\n".join(lines) + "\n</conversation_history>\n\n"
