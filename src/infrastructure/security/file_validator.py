"""Validates attachment extension, size, executable magic headers, and SHA-256 (BR-16)."""

from __future__ import annotations

import hashlib

from domain.common import DomainError, ErrorOr, ErrorType
from domain.documents import validate_attachment_policy


class FileValidator:
    MZ_MAGIC = b"MZ"
    ELF_MAGIC = b"\x7fELF"

    @classmethod
    def validate(cls, file_name: str, content: bytes, max_mb: int = 25) -> ErrorOr[str]:
        pol = validate_attachment_policy(file_name, len(content), max_mb=max_mb)
        if pol.is_error:
            return pol
        if content.startswith(cls.MZ_MAGIC) or content.startswith(cls.ELF_MAGIC):
            return ErrorOr.fail(
                DomainError(
                    code="malicious_binary_signature",
                    message="Se detectó firma binaria ejecutable no permitida (BR-16).",
                    error_type=ErrorType.UNSUPPORTED_MEDIA,
                )
            )
        return ErrorOr.ok(hashlib.sha256(content).hexdigest())
