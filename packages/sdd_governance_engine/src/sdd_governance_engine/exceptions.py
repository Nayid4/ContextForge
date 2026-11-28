"""Domain-specific exceptions for the SDD Governance Engine."""

from __future__ import annotations


class GovernanceEngineError(Exception):
    """Base exception for all sdd_governance_engine errors."""

    def __init__(self, message: str, code: str = "GOVERNANCE_ERROR") -> None:
        super().__init__(message)
        self.message = message
        self.code = code


class UnknownProfileError(GovernanceEngineError):
    """Raised when a requested governance policy profile is not registered."""

    def __init__(self, profile_name: str) -> None:
        super().__init__(
            f"Unknown governance policy profile: '{profile_name}'.",
            code="UNKNOWN_PROFILE",
        )
        self.profile_name = profile_name


class UnknownStrategyError(GovernanceEngineError):
    """Raised when an assignment strategy or report exporter format is not registered."""

    def __init__(self, strategy_or_format: str, kind: str = "strategy") -> None:
        super().__init__(
            f"Unknown {kind}: '{strategy_or_format}'.",
            code=f"UNKNOWN_{kind.upper()}",
        )
        self.strategy_or_format = strategy_or_format


class NoEligibleReviewerError(GovernanceEngineError):
    """Raised when no candidate satisfies eligibility constraints for review assignment."""

    def __init__(self, reason: str = "No active eligible reviewer candidates provided.") -> None:
        super().__init__(reason, code="NO_ELIGIBLE_REVIEWER")
