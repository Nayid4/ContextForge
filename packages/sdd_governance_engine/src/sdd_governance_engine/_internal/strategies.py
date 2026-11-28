"""Behavioral GoF (Strategy): reviewer assignment algorithms."""

from __future__ import annotations

from typing import Sequence

from sdd_governance_engine.contracts import IAssignmentStrategy
from sdd_governance_engine.exceptions import NoEligibleReviewerError
from sdd_governance_engine.models import AssignmentDecision, ReviewerCandidate, TaskContext


def _filter_eligible(
    task: TaskContext,
    candidates: Sequence[ReviewerCandidate],
) -> list[ReviewerCandidate]:
    """Filter available candidates with remaining capacity who are not the task author."""
    eligible = [
        c
        for c in candidates
        if c.is_available
        and c.active_reviews < c.max_capacity
        and (not task.author_id or c.reviewer_id != task.author_id)
    ]
    if not eligible:
        raise NoEligibleReviewerError(
            f"No eligible reviewer found for ticket '{task.ticket_id}' "
            "(all candidates unavailable, at max capacity, or equal to author)."
        )
    return eligible


class LeastWorkloadStrategy(IAssignmentStrategy):
    """Selects the available reviewer with the lowest active workload ratio."""

    @property
    def strategy_name(self) -> str:
        return "least_workload"

    def select_reviewer(
        self,
        task: TaskContext,
        candidates: Sequence[ReviewerCandidate],
    ) -> AssignmentDecision:
        eligible = _filter_eligible(task, candidates)
        best = min(
            eligible,
            key=lambda c: (c.active_reviews / max(1, c.max_capacity), c.active_reviews, c.reviewer_id),
        )
        free_ratio = 1.0 - (best.active_reviews / max(1, best.max_capacity))
        return AssignmentDecision(
            ticket_id=task.ticket_id,
            selected_reviewer_id=best.reviewer_id,
            selected_display_name=best.display_name,
            strategy_used=self.strategy_name,
            affinity_score=round(free_ratio * 100.0, 2),
            rationale=(
                f"Selected '{best.display_name}' due to lowest active load "
                f"({best.active_reviews}/{best.max_capacity})."
            ),
        )


class DomainExpertiseStrategy(IAssignmentStrategy):
    """Balances domain skill overlap (70%) with available capacity (30%)."""

    @property
    def strategy_name(self) -> str:
        return "domain_expertise"

    def select_reviewer(
        self,
        task: TaskContext,
        candidates: Sequence[ReviewerCandidate],
    ) -> AssignmentDecision:
        eligible = _filter_eligible(task, candidates)
        req_set = {s.lower() for s in task.required_skills}

        def compute_score(cand: ReviewerCandidate) -> float:
            cand_skills = {s.lower() for s in cand.skills}
            skill_ratio = (len(req_set & cand_skills) / len(req_set)) if req_set else 1.0
            capacity_ratio = 1.0 - (cand.active_reviews / max(1, cand.max_capacity))
            return (skill_ratio * 70.0) + (capacity_ratio * 30.0)

        scored = sorted(
            ((compute_score(c), c) for c in eligible),
            key=lambda pair: (-pair[0], pair[1].active_reviews, pair[1].reviewer_id),
        )
        best_score, best = scored[0]
        matched = sorted({s.lower() for s in best.skills} & req_set)
        matched_label = ", ".join(matched) if matched else "generalist"
        return AssignmentDecision(
            ticket_id=task.ticket_id,
            selected_reviewer_id=best.reviewer_id,
            selected_display_name=best.display_name,
            strategy_used=self.strategy_name,
            affinity_score=round(best_score, 2),
            rationale=(
                f"Selected '{best.display_name}' with composite expertise score {best_score:.1f} "
                f"(matched skills: {matched_label}; load: {best.active_reviews}/{best.max_capacity})."
            ),
        )


class RoundRobinStrategy(IAssignmentStrategy):
    """Stateful round-robin rotation across eligible candidates."""

    def __init__(self) -> None:
        self._cursor: int = 0

    @property
    def strategy_name(self) -> str:
        return "round_robin"

    def select_reviewer(
        self,
        task: TaskContext,
        candidates: Sequence[ReviewerCandidate],
    ) -> AssignmentDecision:
        eligible = sorted(_filter_eligible(task, candidates), key=lambda c: c.reviewer_id)
        idx = self._cursor % len(eligible)
        self._cursor += 1
        chosen = eligible[idx]
        return AssignmentDecision(
            ticket_id=task.ticket_id,
            selected_reviewer_id=chosen.reviewer_id,
            selected_display_name=chosen.display_name,
            strategy_used=self.strategy_name,
            affinity_score=100.0,
            rationale=f"Selected '{chosen.display_name}' via deterministic round-robin slot #{idx + 1}.",
        )
