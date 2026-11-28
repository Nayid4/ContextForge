"""Concrete Chain of Responsibility validation rules for SDD artifacts."""

from __future__ import annotations

import re
from typing import Sequence

from sdd_governance_engine.contracts import IValidationRule
from sdd_governance_engine.models import Severity, SpecArtifact, ValidationIssue

BRANCH_REGEX = re.compile(r"^(feature|bugfix)/INT-\d{3,}/[a-z0-9][a-z0-9_-]*[a-z0-9]$")
TICKET_REGEX = re.compile(r"^INT-\d{3,}$")
EARS_KEYWORDS = ("DEBE", "NO DEBE", "CUANDO", "MIENTRAS", "SI ", "SHALL", "MUST")


class TicketIdentityRule(IValidationRule):
    """Validates presence of ticket_id (INT-NNN) and non-empty descriptive title."""

    @property
    def rule_id(self) -> str:
        return "RULE-IDENTITY-001"

    def _check(self, artifact: SpecArtifact, issues: list[ValidationIssue]) -> bool:
        if not artifact.ticket_id or not TICKET_REGEX.match(artifact.ticket_id):
            issues.append(
                ValidationIssue(
                    rule_id=self.rule_id,
                    severity=Severity.ERROR,
                    field_name="ticket_id",
                    message="Ticket ID must match 'INT-NNN' (e.g. 'INT-001').",
                )
            )
        if len(artifact.title) < 8:
            issues.append(
                ValidationIssue(
                    rule_id=self.rule_id,
                    severity=Severity.ERROR,
                    field_name="title",
                    message="Specification title must contain at least 8 characters.",
                )
            )
        return False


class BranchNamingRule(IValidationRule):
    """Enforces SDD branch invariant {feature|bugfix}/INT-NNN/{slug} <= max_length."""

    def __init__(self, max_length: int = 80) -> None:
        super().__init__()
        self._max_length = max_length

    @property
    def rule_id(self) -> str:
        return "RULE-BRANCH-002"

    def _check(self, artifact: SpecArtifact, issues: list[ValidationIssue]) -> bool:
        branch = artifact.branch_name
        if not branch:
            issues.append(
                ValidationIssue(
                    rule_id=self.rule_id,
                    severity=Severity.ERROR,
                    field_name="branch_name",
                    message="Branch name is required.",
                )
            )
            return False
        if len(branch) > self._max_length:
            issues.append(
                ValidationIssue(
                    rule_id=self.rule_id,
                    severity=Severity.ERROR,
                    field_name="branch_name",
                    message=(
                        f"Branch length ({len(branch)}) exceeds maximum of {self._max_length} characters."
                    ),
                )
            )
        if not BRANCH_REGEX.match(branch):
            issues.append(
                ValidationIssue(
                    rule_id=self.rule_id,
                    severity=Severity.ERROR,
                    field_name="branch_name",
                    message="Branch must follow '{feature|bugfix}/INT-NNN/{lowercase_slug}'.",
                )
            )
        elif artifact.ticket_id and f"/{artifact.ticket_id}/" not in branch:
            issues.append(
                ValidationIssue(
                    rule_id=self.rule_id,
                    severity=Severity.WARNING,
                    field_name="branch_name",
                    message=f"Branch ticket prefix does not match artifact ticket_id '{artifact.ticket_id}'.",
                )
            )
        return False


class ArtifactSectionsRule(IValidationRule):
    """Verifies completeness of required SDD sections (requirements, design, tasks)."""

    def __init__(self, required_sections: Sequence[str], min_chars: int = 25) -> None:
        super().__init__()
        self._required_sections = tuple(required_sections)
        self._min_chars = min_chars

    @property
    def rule_id(self) -> str:
        return "RULE-SECTIONS-003"

    def _check(self, artifact: SpecArtifact, issues: list[ValidationIssue]) -> bool:
        for sec in self._required_sections:
            content = artifact.sections.get(sec, "").strip()
            if not content:
                issues.append(
                    ValidationIssue(
                        rule_id=self.rule_id,
                        severity=Severity.ERROR,
                        field_name=f"sections.{sec}",
                        message=f"Required SDD section '{sec}' is missing or empty.",
                    )
                )
            elif len(content) < self._min_chars:
                issues.append(
                    ValidationIssue(
                        rule_id=self.rule_id,
                        severity=Severity.WARNING,
                        field_name=f"sections.{sec}",
                        message=f"Section '{sec}' is shorter than recommended ({self._min_chars} chars).",
                    )
                )
        return False


class AcceptanceCriteriaRule(IValidationRule):
    """Validates minimum testable acceptance criteria count."""

    def __init__(self, min_count: int = 2) -> None:
        super().__init__()
        self._min_count = min_count

    @property
    def rule_id(self) -> str:
        return "RULE-AC-004"

    def _check(self, artifact: SpecArtifact, issues: list[ValidationIssue]) -> bool:
        if len(artifact.acceptance_criteria) < self._min_count:
            issues.append(
                ValidationIssue(
                    rule_id=self.rule_id,
                    severity=Severity.ERROR,
                    field_name="acceptance_criteria",
                    message=(
                        f"At least {self._min_count} testable acceptance criteria are required "
                        f"(found {len(artifact.acceptance_criteria)})."
                    ),
                )
            )
        return False


class EarsNotationRule(IValidationRule):
    """Verifies EARS normative keywords in requirements (error in strict, warning in agile)."""

    def __init__(self, strict: bool = True) -> None:
        super().__init__()
        self._strict = strict

    @property
    def rule_id(self) -> str:
        return "RULE-EARS-005"

    def _check(self, artifact: SpecArtifact, issues: list[ValidationIssue]) -> bool:
        sev = Severity.ERROR if self._strict else Severity.WARNING
        if not artifact.ears_requirements:
            issues.append(
                ValidationIssue(
                    rule_id=self.rule_id,
                    severity=sev,
                    field_name="ears_requirements",
                    message="No formal EARS requirements were declared.",
                )
            )
            return False

        for idx, req_text in enumerate(artifact.ears_requirements, start=1):
            upper_txt = req_text.upper()
            if not any(keyword in upper_txt for keyword in EARS_KEYWORDS):
                issues.append(
                    ValidationIssue(
                        rule_id=self.rule_id,
                        severity=sev,
                        field_name=f"ears_requirements[{idx}]",
                        message=f"Requirement #{idx} lacks normative EARS clause (DEBE / NO DEBE / SHALL).",
                    )
                )
        return False
