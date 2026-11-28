from __future__ import annotations
from application.users.queries.GetSystemHealthKpis.GetSystemHealthKpisQuery import GetSystemHealthKpisQuery
from domain.bundles import IBundleRepositoryPort
from domain.common import ErrorOr, PageParams
from domain.documents import IDocumentRepositoryPort
from domain.ports import IEventStore
from domain.projects import IProjectRepositoryPort
from domain.rag import IIndexingJobRepositoryPort, ILLMProviderPort, IndexingJobStatus

class GetSystemHealthKpisQueryHandler:
    def __init__(
        self,
        project_repo: IProjectRepositoryPort,
        doc_repo: IDocumentRepositoryPort,
        bundle_repo: IBundleRepositoryPort,
        job_repo: IIndexingJobRepositoryPort,
        event_store: IEventStore,
        primary_llm: ILLMProviderPort,
    ) -> None:
        self._projects = project_repo
        self._docs = doc_repo
        self._bundles = bundle_repo
        self._jobs = job_repo
        self._events = event_store
        self._llm = primary_llm

    async def handle(self, request: GetSystemHealthKpisQuery) -> ErrorOr[dict[str, object]]:
        projects = await self._projects.list_projects()
        slug = request.project_slug if request.project_slug != "all" else "default"
        docs = await self._docs.list_all(project_slug=slug, only_published=False)
        bundles = await self._bundles.list_by_project(slug)
        dlq_jobs = await self._jobs.list_jobs(project_slug=slug, status=IndexingJobStatus.DEAD_LETTER)
        audit_page = await self._events.list_audit_logs(project_slug=None, pagination=PageParams(1, 100))

        latencies = sorted(r.latency_ms for r in audit_page.items if r.latency_ms >= 0)
        p50 = latencies[len(latencies) // 2] if latencies else 0.0
        p95 = latencies[min(len(latencies) - 1, int(len(latencies) * 0.95))] if latencies else 0.0

        llm_up, llm_msg, llm_lat = await self._llm.check_health()
        by_status: dict[str, int] = {"published": 0, "draft": 0, "in_review": 0, "deprecated": 0}
        for d in docs:
            by_status[d.status.value] = by_status.get(d.status.value, 0) + 1

        global_status = "healthy" if (llm_up and len(dlq_jobs) == 0) else "degraded"
        return ErrorOr.ok(
            {
                "status": global_status,
                "project_slug": slug,
                "projects_count": len(projects),
                "documents_total": len(docs),
                "documents_by_status": by_status,
                "bundles_count": len(bundles),
                "dlq_jobs_count": len(dlq_jobs),
                "latency_p50_ms": round(p50, 2),
                "latency_p95_ms": round(p95, 2),
                "components": {
                    "database": "up",
                    "hybrid_index": "up",
                    "primary_llm": "up" if llm_up else "down",
                    "primary_llm_detail": llm_msg,
                    "primary_llm_latency_ms": llm_lat,
                    "fallback_llm": "ready",
                },
            }
        )
