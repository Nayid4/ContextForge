"""Project webhook subscription entity for publication and reindexing events."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass(frozen=True)
class WebhookEntity:
    webhook_id: str
    project_slug: str
    url: str
    events: tuple[str, ...] = ("document.published", "document.indexed")
    secret: str = ""
    secret_encrypted: str = ""
    is_active: bool = True
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
