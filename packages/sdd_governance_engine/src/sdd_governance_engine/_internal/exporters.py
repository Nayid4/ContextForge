"""Behavioral GoF (Strategy) + GRASP Pure Fabrication: audit report exporters."""

from __future__ import annotations

import json

from sdd_governance_engine.contracts import IReportExporter
from sdd_governance_engine.models import GovernanceAuditRecord


class JsonReportExporter(IReportExporter):
    """Exports GovernanceAuditRecord as formatted UTF-8 JSON."""

    @property
    def format_name(self) -> str:
        return "json"

    def export(self, record: GovernanceAuditRecord) -> str:
        return json.dumps(record.to_dict(), indent=2, ensure_ascii=False)


class MarkdownReportExporter(IReportExporter):
    """Exports GovernanceAuditRecord as Docs-as-Code GitHub-Flavored Markdown."""

    @property
    def format_name(self) -> str:
        return "markdown"

    def export(self, record: GovernanceAuditRecord) -> str:
        lines: list[str] = [
            f"# SDD Governance Audit Report — {record.ticket_id}",
            "",
            f"- **Title**: {record.title}",
            f"- **Generated At**: `{record.generated_at}`",
            "",
        ]
        if record.validation is not None:
            v = record.validation
            status_txt = "PASSED" if v.is_valid else "REJECTED"
            lines.extend(
                [
                    "## 1. Specification Artifact Validation",
                    f"- **Profile**: `{v.profile_name}`",
                    f"- **Status**: **{status_txt}** (Score: `{v.score:.1f}/100`)",
                    f"- **Errors**: `{v.error_count}` | **Warnings**: `{v.warning_count}`",
                    "",
                ]
            )
            if v.issues:
                lines.append("| Rule ID | Severity | Field | Message |")
                lines.append("|---|---|---|---|")
                for iss in v.issues:
                    lines.append(
                        f"| `{iss.rule_id}` | `{iss.severity.value}` | `{iss.field_name}` | {iss.message} |"
                    )
                lines.append("")

        if record.transition is not None:
            t = record.transition
            decision_txt = "AUTHORIZED" if t.allowed else "DENIED"
            lines.extend(
                [
                    "## 2. Workflow Transition Evaluation",
                    f"- **Transition**: `{t.current_state}` -> `{t.target_state}` (Actor: `{t.actor_role}`)",
                    f"- **Decision**: **{decision_txt}**",
                ]
            )
            for reason in t.reasons:
                lines.append(f"  - {reason}")
            lines.append("")

        if record.assignment is not None:
            a = record.assignment
            lines.extend(
                [
                    "## 3. Independent Reviewer Assignment",
                    f"- **Selected Reviewer**: **{a.selected_display_name}** (`{a.selected_reviewer_id}`)",
                    f"- **Strategy**: `{a.strategy_used}` (Affinity: `{a.affinity_score:.1f}`)",
                    f"- **Rationale**: {a.rationale}",
                    "",
                ]
            )

        if record.notes:
            lines.append("## 4. Traceability Notes")
            for note in record.notes:
                lines.append(f"- {note}")
            lines.append("")

        return "\n".join(lines).strip() + "\n"


class TextReportExporter(IReportExporter):
    """Exports GovernanceAuditRecord as plain terminal-friendly text."""

    @property
    def format_name(self) -> str:
        return "text"

    def export(self, record: GovernanceAuditRecord) -> str:
        parts: list[str] = [
            f"=== SDD GOVERNANCE AUDIT [{record.ticket_id}] ===",
            f"Title: {record.title}",
            f"Timestamp: {record.generated_at}",
        ]
        if record.validation is not None:
            v = record.validation
            parts.append(
                f"Validation ({v.profile_name}): {'VALID' if v.is_valid else 'INVALID'} "
                f"[score={v.score:.1f}, errors={v.error_count}, warnings={v.warning_count}]"
            )
            for iss in v.issues:
                parts.append(f"  * [{iss.severity.value.upper()}] {iss.rule_id} ({iss.field_name}): {iss.message}")
        if record.transition is not None:
            t = record.transition
            parts.append(
                f"Transition {t.current_state} -> {t.target_state} ({t.actor_role}): "
                f"{'ALLOWED' if t.allowed else 'BLOCKED'}"
            )
        if record.assignment is not None:
            a = record.assignment
            parts.append(
                f"Assigned Reviewer: {a.selected_display_name} ({a.selected_reviewer_id}) via {a.strategy_used}"
            )
        return "\n".join(parts)
