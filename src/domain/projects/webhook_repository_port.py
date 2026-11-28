"""Repository port for project webhook subscriptions."""

from __future__ import annotations

from typing import Protocol

from domain.projects.webhook_entity import WebhookEntity


class IWebhookRepositoryPort(Protocol):
    async def save_webhook(self, webhook: WebhookEntity) -> WebhookEntity: ...
    async def list_webhooks(self, project_slug: str, active_only: bool = False) -> list[WebhookEntity]: ...
    async def delete_webhook(self, project_slug: str, webhook_id: str) -> bool: ...
