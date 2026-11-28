"""Document hashing, unified diff calculation, and attachment security policies (BR-06, BR-16)."""

from __future__ import annotations

import difflib
import hashlib
from pathlib import PurePosixPath

from domain.common import DomainError, ErrorOr, ErrorType

ALLOWED_ATTACHMENT_EXTENSIONS: frozenset[str] = frozenset(
    {".pdf", ".docx", ".md", ".txt", ".json", ".yaml", ".yml", ".csv", ".xlsx", ".png", ".jpg", ".jpeg", ".svg", ".drawio"}
)
FORBIDDEN_EXECUTABLE_EXTENSIONS: frozenset[str] = frozenset(
    {".exe", ".bat", ".cmd", ".ps1", ".sh", ".dll", ".so", ".msi", ".com", ".scr"}
)


def compute_sha256_text(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def compute_unified_diff(old_content: str, new_content: str, from_label: str, to_label: str) -> tuple[str, int, int]:
    """Deterministic line-by-line unified diff between two document versions (RF-DOC-004)."""
    diff_lines = list(
        difflib.unified_diff(
            old_content.splitlines(),
            new_content.splitlines(),
            fromfile=from_label,
            tofile=to_label,
            lineterm="",
        )
    )
    added = sum(1 for ln in diff_lines if ln.startswith("+") and not ln.startswith("+++"))
    removed = sum(1 for ln in diff_lines if ln.startswith("-") and not ln.startswith("---"))
    return "\n".join(diff_lines), added, removed


def validate_attachment_policy(file_name: str, size_bytes: int, max_mb: int = 25) -> ErrorOr[str]:
    """Validate attachment extension and size limits (RF-DOC-005, BR-16)."""
    ext = PurePosixPath(file_name.strip().lower()).suffix
    if ext in FORBIDDEN_EXECUTABLE_EXTENSIONS or ext not in ALLOWED_ATTACHMENT_EXTENSIONS:
        return ErrorOr.fail(
            DomainError(
                code="unsupported_attachment_type",
                message=f"Extensión '{ext or 'sin extensión'}' no permitida por seguridad documental (BR-16).",
                error_type=ErrorType.UNSUPPORTED_MEDIA,
            )
        )
    max_bytes = max_mb * 1024 * 1024
    if size_bytes <= 0:
        return ErrorOr.fail(DomainError.validation("empty_attachment", "El archivo adjunto está vacío."))
    if size_bytes > max_bytes:
        return ErrorOr.fail(
            DomainError(
                code="attachment_too_large",
                message=f"El archivo excede el tamaño máximo permitido de {max_mb} MB (BR-16).",
                error_type=ErrorType.PAYLOAD_TOO_LARGE,
            )
        )
    return ErrorOr.ok(ext)
