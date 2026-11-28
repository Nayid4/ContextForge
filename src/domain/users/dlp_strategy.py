"""DLP Secret & PII Redaction Strategy prior to external LLM invocation (REI-10, OR-01, OR-03)."""

from __future__ import annotations

import re

REDACTION_PATTERNS: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("PRIVATE_KEY", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----.*?-----END [A-Z ]*PRIVATE KEY-----", re.DOTALL)),
    ("OPENAI_KEY", re.compile(r"\bsk-[A-Za-z0-9_-]{16,}\b")),
    ("AWS_ACCESS_KEY", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("BEARER_JWT", re.compile(r"\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b")),
    ("API_LIVE_KEY", re.compile(r"\bcf_live_[A-Za-z0-9_-]{16,}\b")),
)

PII_EMAIL_PATTERN = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")


class DlpRedactionStrategy:
    """Scans and redacts sensitive secrets and optional PII before contacting non-local LLMs."""

    @staticmethod
    def redact(text: str, *, redact_emails: bool = False) -> tuple[str, int]:
        redacted = text
        replacements = 0
        for label, pattern in REDACTION_PATTERNS:
            redacted, count = pattern.subn(f"[REDACTED:{label}]", redacted)
            replacements += count
        if redact_emails:
            redacted, e_count = PII_EMAIL_PATTERN.subn("[REDACTED:EMAIL]", redacted)
            replacements += e_count
        return redacted, replacements
