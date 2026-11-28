"""Built-in GoF Chain of Responsibility rules for document ingestion governance."""

from __future__ import annotations

from contextforge.contracts import IDocumentRule
from contextforge.exceptions import DocumentValidationError
from contextforge.models import KnowledgeDocument


class TitleRequiredRule(IDocumentRule):
    """Ensures every ingested document has a non-empty identifier and title."""

    @property
    def rule_name(self) -> str:
        return "title_required"

    def validate(self, document: KnowledgeDocument) -> None:
        if not document.doc_id.strip():
            raise DocumentValidationError("Document 'doc_id' cannot be empty.", rule_name=self.rule_name)
        if not document.title.strip():
            raise DocumentValidationError(
                f"Document '{document.doc_id}' must declare a non-empty title.",
                rule_name=self.rule_name,
            )


class NonEmptyContentRule(IDocumentRule):
    """Ensures ingested documents contain indexable content."""

    @property
    def rule_name(self) -> str:
        return "non_empty_content"

    def validate(self, document: KnowledgeDocument) -> None:
        if not document.content.strip():
            raise DocumentValidationError(
                f"Document '{document.doc_id}' has empty content.",
                rule_name=self.rule_name,
            )


class MaxDocumentSizeRule(IDocumentRule):
    """Guards against oversized payloads exceeding configured character limits."""

    def __init__(self, max_chars: int = 250_000) -> None:
        self._max_chars = max(100, max_chars)

    @property
    def rule_name(self) -> str:
        return "max_document_size"

    def validate(self, document: KnowledgeDocument) -> None:
        if len(document.content) > self._max_chars:
            raise DocumentValidationError(
                f"Document '{document.doc_id}' exceeds max size ({len(document.content)} > {self._max_chars} chars).",
                rule_name=self.rule_name,
            )


class DocumentRuleChain:
    """Executes an ordered chain of :class:`IDocumentRule` validators (Chain of Responsibility)."""

    def __init__(self, rules: list[IDocumentRule] | None = None) -> None:
        self._rules: list[IDocumentRule] = list(rules or [])

    def add_rule(self, rule: IDocumentRule) -> None:
        self._rules.append(rule)

    def validate_all(self, document: KnowledgeDocument) -> None:
        for rule in self._rules:
            rule.validate(document)

    @property
    def rule_names(self) -> tuple[str, ...]:
        return tuple(r.rule_name for r in self._rules)
