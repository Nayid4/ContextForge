"""SQLAlchemy Implementation of Taxonomy (Modules & Tags) Repository."""

from __future__ import annotations

import logging
from typing import Sequence
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from domain.taxonomy.entities import ModuleEntity, TagEntity
from domain.taxonomy.repositories import ITaxonomyRepository
from infrastructure.persistence.models.taxonomy_model import ModuleORM, TagORM

logger = logging.getLogger("infrastructure.taxonomy")

DEFAULT_SYSTEM_MODULES: list[dict[str, str]] = [
    {"slug": "architecture", "name": "Arquitectura & ADRs", "icon": "fa-cubes", "color": "indigo", "description": "Decisiones de arquitectura, C4, Clean Architecture y directivas de diseño."},
    {"slug": "billing", "name": "Facturación & Pagos", "icon": "fa-credit-card", "color": "emerald", "description": "Políticas de cobro, reintentos, webhooks y pasarelas de pago."},
    {"slug": "security", "name": "Seguridad & Auth", "icon": "fa-shield-halved", "color": "rose", "description": "Tokens JWT, roles RBAC, cifrado y políticas de seguridad."},
    {"slug": "api", "name": "APIs & Contratos", "icon": "fa-network-wired", "color": "blue", "description": "Contratos OpenAPI, REST, endpoints y versionado de servicios."},
    {"slug": "events", "name": "Event-Driven & Mensajería", "icon": "fa-bolt", "color": "amber", "description": "Colas de mensajes, eventos de dominio, Kafka, RabbitMQ y SSE."},
    {"slug": "database", "name": "Persistencia & Datos", "icon": "fa-database", "color": "purple", "description": "Esquemas relacionales, NoSQL, migraciones y modelos ORM."},
    {"slug": "devops", "name": "DevOps & Cloud", "icon": "fa-server", "color": "teal", "description": "Docker, Kubernetes, CI/CD pipelines y monitorización."},
    {"slug": "frontend", "name": "Frontend & UI/UX", "icon": "fa-desktop", "color": "cyan", "description": "Componentes UI, TailwindCSS, Alpine.js y diseño de interfaces."},
    {"slug": "guides", "name": "Guías & Onboarding", "icon": "fa-book-open", "color": "sky", "description": "Guías paso a paso, manuales de desarrollo y configuración local."},
    {"slug": "testing", "name": "Testing & QA", "icon": "fa-vial", "color": "lime", "description": "Pruebas unitarias, de integración, cobertura y suites E2E."},
    {"slug": "general", "name": "General & Misceláneo", "icon": "fa-folder", "color": "slate", "description": "Notas generales y documentación transversal."},
]

DEFAULT_SYSTEM_TAGS: list[dict[str, str]] = [
    {"slug": "clean-architecture", "name": "Clean Architecture", "color": "indigo"},
    {"slug": "hexagonal", "name": "Hexagonal", "color": "purple"},
    {"slug": "cqrs", "name": "CQRS", "color": "amber"},
    {"slug": "fastapi", "name": "FastAPI", "color": "teal"},
    {"slug": "python", "name": "Python", "color": "blue"},
    {"slug": "stripe", "name": "Stripe", "color": "violet"},
    {"slug": "webhooks", "name": "Webhooks", "color": "rose"},
    {"slug": "jwt", "name": "JWT", "color": "red"},
    {"slug": "docker", "name": "Docker", "color": "sky"},
    {"slug": "rag", "name": "RAG", "color": "emerald"},
    {"slug": "chromadb", "name": "ChromaDB", "color": "pink"},
    {"slug": "llm", "name": "LLM", "color": "cyan"},
    {"slug": "gemini", "name": "Gemini", "color": "blue"},
    {"slug": "ollama", "name": "Ollama", "color": "orange"},
    {"slug": "redis", "name": "Redis", "color": "red"},
    {"slug": "sqlite", "name": "SQLite", "color": "slate"},
    {"slug": "postgresql", "name": "PostgreSQL", "color": "blue"},
    {"slug": "unit-testing", "name": "Unit Testing", "color": "lime"},
    {"slug": "microservices", "name": "Microservices", "color": "indigo"},
    {"slug": "event-driven", "name": "Event Driven", "color": "yellow"},
]


class SqlTaxonomyRepository(ITaxonomyRepository):
    """SQL repository for querying and managing modules and tags with auto-seeding."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def _ensure_seeded(self) -> None:
        """Seed default modules and tags if tables are empty."""
        try:
            m_res = await self._session.execute(select(ModuleORM).limit(1))
            if m_res.scalars().first() is None:
                for item in DEFAULT_SYSTEM_MODULES:
                    m = ModuleORM(
                        id=f"mod_{item['slug']}",
                        slug=item["slug"],
                        name=item["name"],
                        description=item["description"],
                        icon=item["icon"],
                        color=item["color"],
                        project_slug=None,
                    )
                    self._session.add(m)
                await self._session.commit()

            t_res = await self._session.execute(select(TagORM).limit(1))
            if t_res.scalars().first() is None:
                for item in DEFAULT_SYSTEM_TAGS:
                    t = TagORM(
                        id=f"tag_{item['slug']}",
                        slug=item["slug"],
                        name=item["name"],
                        color=item["color"],
                        project_slug=None,
                    )
                    self._session.add(t)
                await self._session.commit()
        except Exception as e:
            logger.debug(f"Taxonomy auto-seeding skipped or already handled: {e}")
            await self._session.rollback()

    async def list_modules(
        self,
        project_slug: str | None = None,
        search: str | None = None,
    ) -> list[ModuleEntity]:
        await self._ensure_seeded()
        stmt = select(ModuleORM)

        # Include global modules (project_slug IS NULL) and project-specific modules if provided
        if project_slug:
            stmt = stmt.where(or_(ModuleORM.project_slug.is_(None), ModuleORM.project_slug == project_slug))
        
        if search and search.strip():
            s = f"%{search.strip().lower()}%"
            stmt = stmt.where(or_(ModuleORM.name.ilike(s), ModuleORM.slug.ilike(s), ModuleORM.description.ilike(s)))

        stmt = stmt.order_by(ModuleORM.name.asc())
        result = await self._session.execute(stmt)
        rows: Sequence[ModuleORM] = result.scalars().all()
        return [
            ModuleEntity(
                id=r.id,
                slug=r.slug,
                name=r.name,
                description=r.description or "",
                color=r.color,
                icon=r.icon,
                project_slug=r.project_slug,
                created_at=r.created_at,
            )
            for r in rows
        ]

    async def get_module_by_slug(self, slug: str) -> ModuleEntity | None:
        await self._ensure_seeded()
        stmt = select(ModuleORM).where(ModuleORM.slug == slug.strip().lower())
        res = await self._session.execute(stmt)
        r = res.scalars().first()
        if not r:
            return None
        return ModuleEntity(
            id=r.id,
            slug=r.slug,
            name=r.name,
            description=r.description or "",
            color=r.color,
            icon=r.icon,
            project_slug=r.project_slug,
            created_at=r.created_at,
        )

    async def save_module(self, module: ModuleEntity) -> ModuleEntity:
        stmt = select(ModuleORM).where(ModuleORM.slug == module.slug)
        res = await self._session.execute(stmt)
        existing = res.scalars().first()
        if existing:
            existing.name = module.name
            existing.description = module.description
            existing.color = module.color
            existing.icon = module.icon
            existing.project_slug = module.project_slug
        else:
            orm = ModuleORM(
                id=module.id,
                slug=module.slug,
                name=module.name,
                description=module.description,
                color=module.color,
                icon=module.icon,
                project_slug=module.project_slug,
            )
            self._session.add(orm)
        await self._session.commit()
        return module

    async def list_tags(
        self,
        project_slug: str | None = None,
        search: str | None = None,
    ) -> list[TagEntity]:
        await self._ensure_seeded()
        stmt = select(TagORM)
        if project_slug:
            stmt = stmt.where(or_(TagORM.project_slug.is_(None), TagORM.project_slug == project_slug))
        if search and search.strip():
            s = f"%{search.strip().lower()}%"
            stmt = stmt.where(or_(TagORM.name.ilike(s), TagORM.slug.ilike(s)))

        stmt = stmt.order_by(TagORM.name.asc())
        result = await self._session.execute(stmt)
        rows: Sequence[TagORM] = result.scalars().all()
        return [
            TagEntity(
                id=r.id,
                slug=r.slug,
                name=r.name,
                color=r.color,
                project_slug=r.project_slug,
                created_at=r.created_at,
            )
            for r in rows
        ]

    async def get_tag_by_slug(self, slug: str) -> TagEntity | None:
        await self._ensure_seeded()
        stmt = select(TagORM).where(TagORM.slug == slug.strip().lower())
        res = await self._session.execute(stmt)
        r = res.scalars().first()
        if not r:
            return None
        return TagEntity(
            id=r.id,
            slug=r.slug,
            name=r.name,
            color=r.color,
            project_slug=r.project_slug,
            created_at=r.created_at,
        )

    async def save_tag(self, tag: TagEntity) -> TagEntity:
        stmt = select(TagORM).where(TagORM.slug == tag.slug)
        res = await self._session.execute(stmt)
        existing = res.scalars().first()
        if existing:
            existing.name = tag.name
            existing.color = tag.color
            existing.project_slug = tag.project_slug
        else:
            orm = TagORM(
                id=tag.id,
                slug=tag.slug,
                name=tag.name,
                color=tag.color,
                project_slug=tag.project_slug,
            )
            self._session.add(orm)
        await self._session.commit()
        return tag

