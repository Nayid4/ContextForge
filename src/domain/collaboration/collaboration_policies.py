"""Comment sanitization (anti-XSS) and rating bounds validation policies."""

from __future__ import annotations

import html
import re

from domain.common import DomainError, ErrorOr

SCRIPT_TAG_RE = re.compile(r"<\s*script[^>]*>.*?<\s*/\s*script\s*>", flags=re.IGNORECASE | re.DOTALL)


def sanitize_comment_text(raw: str) -> str:
    """Strip dangerous script tags and escape HTML entities against stored XSS (RF-COL-002, RNF-04)."""
    without_scripts = SCRIPT_TAG_RE.sub("", raw.strip())
    return html.escape(without_scripts, quote=False)


def validate_rating_score(score: int) -> ErrorOr[int]:
    if not isinstance(score, int) or score < 1 or score > 5:
        return ErrorOr.fail(DomainError.validation("invalid_rating_score", "La calificación debe ser un entero entre 1 y 5 (RF-COL-003)."))
    return ErrorOr.ok(score)
