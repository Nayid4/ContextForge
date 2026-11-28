"""Base Aggregate Root collecting uncommitted domain events."""

from __future__ import annotations

from domain.common.domain_event import DomainEvent


class AggregateRoot:
    def __init__(self) -> None:
        self._domain_events: list[DomainEvent] = []

    def record_event(self, event: DomainEvent) -> None:
        self._domain_events.append(event)

    def pull_domain_events(self) -> list[DomainEvent]:
        events = list(self._domain_events)
        self._domain_events.clear()
        return events
