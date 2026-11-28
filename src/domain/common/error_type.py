"""Canonical domain error taxonomy mapped deterministically to HTTP status codes."""

from __future__ import annotations

from enum import Enum


class ErrorType(str, Enum):
    VALIDATION = "validation"
    NOT_FOUND = "not_found"
    CONFLICT = "conflict"
    UNAUTHORIZED = "unauthorized"
    FORBIDDEN = "forbidden"
    LOCKED = "locked"
    PAYLOAD_TOO_LARGE = "payload_too_large"
    UNSUPPORTED_MEDIA = "unsupported_media"
    RATE_LIMITED = "rate_limited"
    EXTERNAL_FAILURE = "external_failure"
