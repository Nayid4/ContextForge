"""Executes standard and custom document validation rules before persistence (RF-DOC-001)."""

from __future__ import annotations

from dataclasses import dataclass, field

from domain.common import DomainError, ErrorOr
from domain.documents.document_governance_rule_port import IDocumentGovernanceRule


@dataclass(frozen=True)
class StandardGovernancePipeline:
    max_chars: int = 500_000
    extra_rules: tuple[IDocumentGovernanceRule, ...] = field(default_factory=tuple)

    def validate(self, path: str, title: str, content: str) -> ErrorOr[None]:
        clean_path = path.strip().replace("\\", "/")
        if not clean_path or ".." in clean_path.split("/"):
            return ErrorOr.fail(
                DomainError.validation(
                    "non_empty_safe_path",
                    "La ruta del documento es inválida o insegura (BR-02, BR-03).",
                    rule_name="non_empty_safe_path",
                )
            )
        if not title.strip():
            return ErrorOr.fail(
                DomainError.validation(
                    "non_empty_title",
                    "El título del documento es obligatorio (BR-02).",
                    rule_name="non_empty_title",
                )
            )
        if not content.strip():
            return ErrorOr.fail(
                DomainError.validation(
                    "non_empty_content",
                    "El contenido Markdown no puede estar vacío (BR-02).",
                    rule_name="non_empty_content",
                )
            )
        if len(content) > self.max_chars:
            return ErrorOr.fail(
                DomainError.validation(
                    "max_content_length",
                    f"El documento supera el máximo permitido de {self.max_chars} caracteres (BR-02).",
                    rule_name="max_content_length",
                )
            )
        for rule in self.extra_rules:
            err = rule.validate(clean_path, title, content)
            if err is not None:
                return ErrorOr.fail(err)
        return ErrorOr.ok(None)
