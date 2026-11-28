"""SQLAlchemy Async Repository for project-scoped AI Agents with DB pagination and immutable version history."""

from __future__ import annotations

from datetime import datetime, timezone
import json
import uuid
from sqlalchemy import delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from domain.agents import AgentEntity, AgentEvalCaseEntity, AgentVersionEntity, IAgentRepositoryPort
from domain.common import PagedResult, PageParams
from infrastructure.persistence.models import AgentEvalCaseORM, AgentORM, AgentVersionORM


def _loads_tuple(raw: str, default: tuple[str, ...] = ()) -> tuple[str, ...]:
    try:
        val = json.loads(raw or "[]")
        if isinstance(val, list):
            return tuple(str(x) for x in val if str(x).strip()) or default
    except Exception:
        pass
    return default


def _map_agent(r: AgentORM) -> AgentEntity:
    return AgentEntity(
        agent_id=r.agent_id,
        project_slug=r.project_slug,
        slug=r.slug,
        name=r.name,
        description=r.description or "",
        system_prompt=r.system_prompt or "",
        llm_provider=r.llm_provider or "",
        llm_model=r.llm_model or "",
        temperature=float(r.temperature),
        max_tokens=int(r.max_tokens),
        top_k=int(r.top_k),
        min_grounding_score=float(r.min_grounding_score),
        allowed_modules=_loads_tuple(r.allowed_modules_json),
        allowed_tags=_loads_tuple(r.allowed_tags_json),
        allowed_statuses=_loads_tuple(r.allowed_statuses_json, ("published",)),
        welcome_message=r.welcome_message or "",
        suggested_questions=_loads_tuple(r.suggested_questions_json),
        topic_boundaries=r.topic_boundaries or "",
        visibility=AgentEntity.normalize_visibility(getattr(r, "visibility", "internal")),
        daily_quota_requests=int(getattr(r, "daily_quota_requests", 500) or 500),
        current_version=int(r.current_version or 1),
        is_active=bool(r.is_active),
        created_at=r.created_at,
        updated_at=r.updated_at,
    )


def _snapshot_json(agent: AgentEntity) -> str:
    return json.dumps(
        {
            "name": agent.name,
            "description": agent.description,
            "system_prompt": agent.system_prompt,
            "llm_provider": agent.llm_provider,
            "llm_model": agent.llm_model,
            "temperature": agent.temperature,
            "max_tokens": agent.max_tokens,
            "top_k": agent.top_k,
            "min_grounding_score": agent.min_grounding_score,
            "allowed_modules": list(agent.allowed_modules),
            "allowed_tags": list(agent.allowed_tags),
            "allowed_statuses": list(agent.allowed_statuses),
            "welcome_message": agent.welcome_message,
            "suggested_questions": list(agent.suggested_questions),
            "topic_boundaries": agent.topic_boundaries,
            "visibility": agent.visibility,
            "daily_quota_requests": agent.daily_quota_requests,
        },
        ensure_ascii=False,
    )


class SqlAgentRepository(IAgentRepositoryPort):
    def __init__(self, session_maker: async_sessionmaker[AsyncSession]) -> None:
        self._sm = session_maker

    async def list_paginated(
        self,
        *,
        project_slug: str | None = None,
        search: str | None = None,
        pagination: PageParams = PageParams(),
    ) -> PagedResult[AgentEntity]:
        norm = pagination.normalized()
        async with self._sm() as s:
            stmt = select(AgentORM)
            cnt = select(func.count()).select_from(AgentORM)
            if project_slug:
                stmt = stmt.where(AgentORM.project_slug == project_slug)
                cnt = cnt.where(AgentORM.project_slug == project_slug)
            if search and search.strip():
                q = f"%{search.strip()}%"
                cond = or_(AgentORM.name.ilike(q), AgentORM.slug.ilike(q), AgentORM.description.ilike(q))
                stmt = stmt.where(cond)
                cnt = cnt.where(cond)
            total = int((await s.execute(cnt)).scalar_one() or 0)
            rows = (
                await s.execute(
                    stmt.order_by(AgentORM.project_slug.asc(), AgentORM.slug.asc()).offset(norm.offset).limit(norm.page_size)
                )
            ).scalars().all()
            return PagedResult(items=tuple(_map_agent(r) for r in rows), page=norm.page, page_size=norm.page_size, total_count=total)

    async def list_all(self, project_slug: str | None = None) -> list[AgentEntity]:
        async with self._sm() as s:
            stmt = select(AgentORM)
            if project_slug:
                stmt = stmt.where(AgentORM.project_slug == project_slug)
            rows = (await s.execute(stmt.order_by(AgentORM.project_slug.asc(), AgentORM.slug.asc()))).scalars().all()
            return [_map_agent(r) for r in rows]

    async def get_by_slug(self, project_slug: str, agent_slug: str) -> AgentEntity | None:
        async with self._sm() as s:
            r = (
                await s.execute(
                    select(AgentORM).where(AgentORM.project_slug == project_slug, AgentORM.slug == agent_slug)
                )
            ).scalar_one_or_none()
            return _map_agent(r) if r else None

    async def get_by_id(self, agent_id: str) -> AgentEntity | None:
        async with self._sm() as s:
            r = (await s.execute(select(AgentORM).where(AgentORM.agent_id == agent_id))).scalar_one_or_none()
            return _map_agent(r) if r else None

    async def save(
        self,
        agent: AgentEntity,
        *,
        author_id: str = "system",
        change_summary: str = "",
    ) -> AgentEntity:
        now = datetime.now(timezone.utc)
        async with self._sm() as s:
            existing = (
                await s.execute(
                    select(AgentORM).where(AgentORM.project_slug == agent.project_slug, AgentORM.slug == agent.slug)
                )
            ).scalar_one_or_none()
            if existing is None:
                ver_num = 1
                existing = AgentORM(
                    agent_id=agent.agent_id,
                    project_slug=agent.project_slug,
                    slug=agent.slug,
                    name=agent.name,
                    description=agent.description,
                    system_prompt=agent.system_prompt,
                    llm_provider=agent.llm_provider,
                    llm_model=agent.llm_model,
                    temperature=agent.temperature,
                    max_tokens=agent.max_tokens,
                    top_k=agent.top_k,
                    min_grounding_score=agent.min_grounding_score,
                    allowed_modules_json=json.dumps(list(agent.allowed_modules), ensure_ascii=False),
                    allowed_tags_json=json.dumps(list(agent.allowed_tags), ensure_ascii=False),
                    allowed_statuses_json=json.dumps(list(agent.allowed_statuses), ensure_ascii=False),
                    welcome_message=agent.welcome_message,
                    suggested_questions_json=json.dumps(list(agent.suggested_questions), ensure_ascii=False),
                    topic_boundaries=agent.topic_boundaries,
                    visibility=agent.visibility,
                    daily_quota_requests=agent.daily_quota_requests,
                    current_version=ver_num,
                    is_active=agent.is_active,
                    created_at=now,
                    updated_at=now,
                )
                s.add(existing)
            else:
                ver_num = int(existing.current_version or 1) + 1
                existing.name = agent.name
                existing.description = agent.description
                existing.system_prompt = agent.system_prompt
                existing.llm_provider = agent.llm_provider
                existing.llm_model = agent.llm_model
                existing.temperature = agent.temperature
                existing.max_tokens = agent.max_tokens
                existing.top_k = agent.top_k
                existing.min_grounding_score = agent.min_grounding_score
                existing.allowed_modules_json = json.dumps(list(agent.allowed_modules), ensure_ascii=False)
                existing.allowed_tags_json = json.dumps(list(agent.allowed_tags), ensure_ascii=False)
                existing.allowed_statuses_json = json.dumps(list(agent.allowed_statuses), ensure_ascii=False)
                existing.welcome_message = agent.welcome_message
                existing.suggested_questions_json = json.dumps(list(agent.suggested_questions), ensure_ascii=False)
                existing.topic_boundaries = agent.topic_boundaries
                existing.visibility = agent.visibility
                existing.daily_quota_requests = agent.daily_quota_requests
                existing.current_version = ver_num
                existing.is_active = agent.is_active
                existing.updated_at = now

            saved_entity = _map_agent(existing)
            s.add(
                AgentVersionORM(
                    version_id=str(uuid.uuid4()),
                    agent_id=existing.agent_id,
                    version_number=ver_num,
                    config_json=_snapshot_json(saved_entity),
                    author_id=author_id,
                    change_summary=change_summary or f"Versión v{ver_num}",
                    created_at=now,
                )
            )
            await s.commit()
            return saved_entity

    async def list_versions(self, agent_id: str) -> list[AgentVersionEntity]:
        async with self._sm() as s:
            rows = (
                await s.execute(
                    select(AgentVersionORM)
                    .where(AgentVersionORM.agent_id == agent_id)
                    .order_by(AgentVersionORM.version_number.desc())
                )
            ).scalars().all()
            return [
                AgentVersionEntity(
                    version_id=r.version_id,
                    agent_id=r.agent_id,
                    version_number=r.version_number,
                    config_json=r.config_json,
                    author_id=r.author_id,
                    change_summary=r.change_summary,
                    created_at=r.created_at,
                )
                for r in rows
            ]

    async def get_version(self, agent_id: str, version_number: int) -> AgentVersionEntity | None:
        async with self._sm() as s:
            r = (
                await s.execute(
                    select(AgentVersionORM).where(
                        AgentVersionORM.agent_id == agent_id,
                        AgentVersionORM.version_number == version_number,
                    )
                )
            ).scalar_one_or_none()
            if r is None:
                return None
            return AgentVersionEntity(
                version_id=r.version_id,
                agent_id=r.agent_id,
                version_number=r.version_number,
                config_json=r.config_json,
                author_id=r.author_id,
                change_summary=r.change_summary,
                created_at=r.created_at,
            )

    async def delete(self, project_slug: str, agent_slug: str) -> bool:
        async with self._sm() as s:
            res = await s.execute(
                delete(AgentORM).where(AgentORM.project_slug == project_slug, AgentORM.slug == agent_slug)
            )
            await s.commit()
            return bool(res.rowcount)

    async def save_eval_case(self, case: AgentEvalCaseEntity) -> AgentEvalCaseEntity:
        async with self._sm() as s:
            s.add(
                AgentEvalCaseORM(
                    case_id=case.case_id,
                    agent_id=case.agent_id,
                    project_slug=case.project_slug,
                    question=case.question,
                    expected_citation_path=case.expected_citation_path,
                    expected_substring=case.expected_substring,
                    created_at=case.created_at,
                )
            )
            await s.commit()
            return case

    async def list_eval_cases(self, agent_id: str) -> list[AgentEvalCaseEntity]:
        async with self._sm() as s:
            rows = (
                await s.execute(
                    select(AgentEvalCaseORM)
                    .where(AgentEvalCaseORM.agent_id == agent_id)
                    .order_by(AgentEvalCaseORM.created_at.asc())
                )
            ).scalars().all()
            return [
                AgentEvalCaseEntity(
                    case_id=r.case_id,
                    agent_id=r.agent_id,
                    project_slug=r.project_slug,
                    question=r.question,
                    expected_citation_path=r.expected_citation_path,
                    expected_substring=r.expected_substring,
                    created_at=r.created_at,
                )
                for r in rows
            ]

    async def delete_eval_case(self, agent_id: str, case_id: str) -> bool:
        async with self._sm() as s:
            res = await s.execute(
                delete(AgentEvalCaseORM).where(
                    AgentEvalCaseORM.agent_id == agent_id,
                    AgentEvalCaseORM.case_id == case_id,
                )
            )
            await s.commit()
            return bool(res.rowcount)
