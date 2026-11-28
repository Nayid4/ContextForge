"""ContextForge public exception hierarchy.

All operational, validation, extension, and provider errors raised by the
ContextForge public API inherit from :class:`ContextForgeError`.
"""

from __future__ import annotations


class ContextForgeError(Exception):
    """Base exception for all ContextForge component errors."""

    def __init__(self, message: str, *, code: str = "CONTEXTFORGE_ERROR") -> None:
        super().__init__(message)
        self.message = message
        self.code = code


class DocumentValidationError(ContextForgeError):
    """Raised when a document fails one or more governance validation rules."""

    def __init__(self, message: str, *, rule_name: str = "unknown") -> None:
        super().__init__(message, code="DOCUMENT_VALIDATION_ERROR")
        self.rule_name = rule_name


class UnknownStrategyError(ContextForgeError):
    """Raised when a requested chunking, retrieval, or ranking strategy is not registered."""

    def __init__(self, strategy_name: str, *, kind: str = "strategy") -> None:
        super().__init__(
            f"Unknown {kind} '{strategy_name}'. Register it before use.",
            code="UNKNOWN_STRATEGY",
        )
        self.strategy_name = strategy_name
        self.kind = kind


class UnknownExportFormatError(ContextForgeError):
    """Raised when an unregistered Context Bundle export format is requested."""

    def __init__(self, format_name: str, available: list[str] | None = None) -> None:
        avail = f" Available: {', '.join(sorted(available))}." if available else ""
        super().__init__(
            f"Unsupported bundle export format '{format_name}'.{avail}",
            code="UNKNOWN_EXPORT_FORMAT",
        )
        self.format_name = format_name


class TokenBudgetExceededError(ContextForgeError):
    """Raised when a requested token budget is invalid or cannot fit minimal context."""

    def __init__(self, message: str) -> None:
        super().__init__(message, code="TOKEN_BUDGET_EXCEEDED")


class ProviderUnavailableError(ContextForgeError):
    """Raised when the configured LLM provider fails to produce a completion."""

    def __init__(self, provider_name: str, reason: str) -> None:
        super().__init__(
            f"LLM provider '{provider_name}' unavailable: {reason}",
            code="PROVIDER_UNAVAILABLE",
        )
        self.provider_name = provider_name
        self.reason = reason


class EmptyKnowledgeBaseError(ContextForgeError):
    """Raised when an operation explicitly requires indexed documents and none exist."""

    def __init__(self, message: str = "Knowledge base has no indexed documents.") -> None:
        super().__init__(message, code="EMPTY_KNOWLEDGE_BASE")
