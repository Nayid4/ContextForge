"""SQLAlchemy Async Repository for Answer Feedback and Topic-Clustered Knowledge Gaps."""

from __future__ import annotations

from datetime import datetime, timezone
import re
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from domain.rag.answer_feedback_entity import AnswerFeedbackEntity
from domain.rag.feedback_and_gap_repository_port import IFeedbackAndGapRepositoryPort
from domain.rag.knowledge_gap_entity import KnowledgeGapEntity
from infrastructure.persistence.models import AnswerFeedbackORM, KnowledgeGapORM

_STOPWORDS = frozenset(
    {"como", "cómo", "cual", "cuál", "para", "sobre", "tiene", "esta", "este", "son", "los", "las", "del", "una", "what", "when", "where", "with", "that", "this", "from"}
)


def _derive_topic_cluster(question: str) -> str:
    tokens = [w.lower() for w in re.findall(r"[A-Za-zÁÉÍÓÚáéíóúÑñ0-9_-]{4,}", question)]
    key_terms = [t for t in tokens if t not in _STOPWORDS]
    if not key_terms:
        return "general"
    return "-".join(dict.fromkeys(key_terms[:3]))[:100]


def _map_gap(r: KnowledgeGapORM) -> KnowledgeGapEntity:
    return KnowledgeGapEntity(
        gap_id=r.gap_id,
        project_slug=r.project_slug,
        agent_slug=r.agent_slug,
        question=r.question,
        topic_cluster=r.topic_cluster,
        occurrences=r.occurrences,
        status=r.status,
        assigned_to=getattr(r, "assigned_to", "") or "",
        ignored_reason=getattr(r, "ignored_reason", "") or "",
        resolved_by_doc_path=getattr(r, "resolved_by_doc_path", "") or "",
        suggested_module=getattr(r, "suggested_module", "general") or "general",
        last_asked_at=r.last_asked_at,
    )


class SqlFeedbackAndGapRepository(IFeedbackAndGapRepositoryPort):
    def __init__(self, session_maker: async_sessionmaker[AsyncSession]) -> None:
        self._sm = session_maker

    async def save_feedback(self, feedback: AnswerFeedbackEntity) -> AnswerFeedbackEntity:
        async with self._sm() as s:
            s.add(
                AnswerFeedbackORM(
                    feedback_id=feedback.feedback_id,
                    project_slug=feedback.project_slug,
                    agent_slug=feedback.agent_slug,
                    question=feedback.question,
                    answer_excerpt=feedback.answer_excerpt[:400],
                    vote=feedback.vote,
                    reason=feedback.reason,
                    user_id=feedback.user_id,
                    created_at=feedback.created_at,
                )
            )
            await s.commit()
            return feedback

    async def list_feedback(self, project_slug: str, limit: int = 50) -> list[AnswerFeedbackEntity]:
        async with self._sm() as s:
            rows = (
                await s.execute(
                    select(AnswerFeedbackORM)
                    .where(AnswerFeedbackORM.project_slug == project_slug)
                    .order_by(AnswerFeedbackORM.created_at.desc())
                    .limit(limit)
                )
            ).scalars().all()
            return [
                AnswerFeedbackEntity(
                    feedback_id=r.feedback_id,
                    project_slug=r.project_slug,
                    agent_slug=r.agent_slug,
                    question=r.question,
                    answer_excerpt=r.answer_excerpt,
                    vote=r.vote,
                    reason=r.reason,
                    user_id=r.user_id,
                    created_at=r.created_at,
                )
                for r in rows
            ]

    async def record_gap(self, *, project_slug: str, agent_slug: str, question: str) -> KnowledgeGapEntity:
        clean_q = question.strip()
        cluster = _derive_topic_cluster(clean_q)
        now = datetime.now(timezone.utc)
        async with self._sm() as s:
            existing = (
                await s.execute(
                    select(KnowledgeGapORM).where(
                        KnowledgeGapORM.project_slug == project_slug,
                        KnowledgeGapORM.topic_cluster == cluster,
                        KnowledgeGapORM.status == "open",
                    )
                )
            ).scalar_one_or_none()
            if existing is not None:
                existing.occurrences = int(existing.occurrences or 1) + 1
                existing.question = clean_q
                existing.last_asked_at = now
                row = existing
            else:
                row = KnowledgeGapORM(
                    gap_id=str(uuid.uuid4()),
                    project_slug=project_slug,
                    agent_slug=agent_slug,
                    question=clean_q,
                    topic_cluster=cluster,
                    occurrences=1,
                    status="open",
                    last_asked_at=now,
                )
                s.add(row)
            await s.commit()
            return _map_gap(row)

    async def get_gap(self, gap_id: str) -> KnowledgeGapEntity | None:
        async with self._sm() as s:
            r = (await s.execute(select(KnowledgeGapORM).where(KnowledgeGapORM.gap_id == gap_id))).scalar_one_or_none()
            return _map_gap(r) if r else None

    async def list_gaps(self, project_slug: str, status: str | None = None) -> list[KnowledgeGapEntity]:
        async with self._sm() as s:
            stmt = select(KnowledgeGapORM).where(KnowledgeGapORM.project_slug == project_slug)
            if status:
                stmt = stmt.where(KnowledgeGapORM.status == status)
            rows = (
                await s.execute(stmt.order_by(KnowledgeGapORM.occurrences.desc(), KnowledgeGapORM.last_asked_at.desc()))
            ).scalars().all()
            return [_map_gap(r) for r in rows]

    async def resolve_gap(self, gap_id: str, resolved_by_doc_path: str = "") -> bool:
        async with self._sm() as s:
            r = (await s.execute(select(KnowledgeGapORM).where(KnowledgeGapORM.gap_id == gap_id))).scalar_one_or_none()
            if r is None:
                return False
            r.status = "resolved"
            if resolved_by_doc_path:
                r.resolved_by_doc_path = resolved_by_doc_path
            await s.commit()
            return True

    async def assign_gap(self, gap_id: str, assigned_to: str) -> bool:
        async with self._sm() as s:
            r = (await s.execute(select(KnowledgeGapORM).where(KnowledgeGapORM.gap_id == gap_id))).scalar_one_or_none()
            if r is None:
                return False
            r.assigned_to = assigned_to.strip()
            await s.commit()
            return True

    async def ignore_gap(self, gap_id: str, reason: str) -> bool:
        async with self._sm() as s:
            r = (await s.execute(select(KnowledgeGapORM).where(KnowledgeGapORM.gap_id == gap_id))).scalar_one_or_none()
            if r is None:
                return False
            r.status = "ignored"
            r.ignored_reason = reason.strip()
            await s.commit()
            return True

    async def auto_resolve_gaps_for_document(self, project_slug: str, doc_path: str, title: str, content_markdown: str) -> int:
        """Automatically closes open knowledge gaps whose topic terms are now covered by a newly published document (BR-24)."""
        haystack = f"{title} {doc_path} {content_markdown}".lower()
        resolved_count = 0
        async with self._sm() as s:
            rows = (
                await s.execute(
                    select(KnowledgeGapORM).where(
                        KnowledgeGapORM.project_slug == project_slug,
                        KnowledgeGapORM.status == "open",
                    )
                )
            ).scalars().all()
            for r in rows:
                terms = [t for t in (r.topic_cluster or "").split("-") if len(t) >= 4 and t != "general"]
                if not terms:
                    continue
                matched = sum(1 for t in terms if t in haystack)
                threshold = 1 if len(terms) == 1 else max(2, (len(terms) + 1) // 2)
                if matched >= threshold:
                    r.status = "resolved"
                    r.resolved_by_doc_path = doc_path
                    resolved_count += 1
            if resolved_count:
                await s.commit()
        return resolved_count
