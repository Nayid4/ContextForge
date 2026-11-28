"""Path traversal protection policy (BR-03)."""

from __future__ import annotations

from pathlib import Path

from domain.common import DomainError, ErrorOr


def validate_safe_relative_path(target_path: str, allowed_root: Path | None = None) -> ErrorOr[str]:
    """Prevent path traversal outside canonical workspace/project root (BR-03)."""
    cleaned = target_path.strip().replace("\\", "/")
    if not cleaned or ".." in cleaned.split("/"):
        return ErrorOr.fail(
            DomainError.forbidden(
                "path_traversal_detected",
                "Ruta inválida o fuera del directorio permitido del proyecto (BR-03).",
                attempted_path=target_path,
            )
        )
    if allowed_root is not None:
        root_resolved = allowed_root.resolve()
        candidate = (root_resolved / cleaned).resolve()
        if not candidate.is_relative_to(root_resolved):
            return ErrorOr.fail(
                DomainError.forbidden(
                    "path_escape_detected",
                    "La ruta resuelta escapa de la raíz confinada del proyecto (BR-03).",
                )
            )
    return ErrorOr.ok(cleaned)
