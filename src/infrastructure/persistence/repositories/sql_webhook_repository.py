"""SQLAlchemy Async Repository for Project Webhooks."""

from __future__ import annotations

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from domain.projects.webhook_entity import WebhookEntity
from domain.projects.webhook_repository_port import IWebhookRepositoryPort
from infrastructure.persistence.models import WebhookORM


class SqlWebhookRepository(IWebhookRepositoryPort):
    def __init__(self, session_maker: async_sessionmaker[AsyncSession]) -> None:
        self._sm = session_maker

    async def save_webhook(self, webhook: WebhookEntity) -> WebhookEntity:
        async with self._sm() as s:
            s.add(
                WebhookORM(
                    webhook_id=webhook.webhook_id,
                    project_slug=webhook.project_slug,
                    url=webhook.url,
                    events_csv=",".join(webhook.events),
                    secret="" if webhook.secret_encrypted else webhook.secret,
                    secret_encrypted=webhook.secret_encrypted,
                    is_active=webhook.is_active,
                    created_at=webhook.created_at,
                )
            )
            await s.commit()
            return webhook

    async def list_webhooks(self, project_slug: str, active_only: bool = False) -> list[WebhookEntity]:
        async with self._sm() as s:
            stmt = select(WebhookORM).where(WebhookORM.project_slug == project_slug)
            if active_only:
                stmt = stmt.where(WebhookORM.is_active == True)  # noqa: E712
            rows = (await s.execute(stmt.order_by(WebhookORM.created_at.desc()))).scalars().all()
            return [
                WebhookEntity(
                    webhook_id=r.webhook_id,
                    project_slug=r.project_slug,
                    url=r.url,
                    events=tuple(e.strip() for e in (r.events_csv or "").split(",") if e.strip()),
                    secret=r.secret,
                    secret_encrypted=getattr(r, "secret_encrypted", "") or "",
                    is_active=bool(r.is_active),
                    created_at=r.created_at,
                )
                for r in rows
            ]

    async def delete_webhook(self, project_slug: str, webhook_id: str) -> bool:
        async with self._sm() as s:
            res = await s.execute(
                delete(WebhookORM).where(WebhookORM.project_slug == project_slug, WebhookORM.webhook_id == webhook_id)
            )
            await s.commit()
            return bool(res.rowcount)
