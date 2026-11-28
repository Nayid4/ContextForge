"""Lightweight Prometheus Text Exposition (v0.0.4) Metrics Registry with zero external dependencies."""

from __future__ import annotations

from collections import defaultdict
import time


class PrometheusMetricsRegistry:
    """Collects HTTP, RAG, Agent, Abstention and Knowledge Base gauges/counters for GET /metrics."""

    def __init__(self) -> None:
        self._started_at = time.time()
        self._http_requests: dict[tuple[str, int], int] = defaultdict(int)
        self._rag_queries_total: int = 0
        self._rag_abstentions_total: int = 0
        self._rag_latency_ms_sum: float = 0.0
        self._webhooks_dispatched_total: int = 0

    def observe_http(self, method: str, status_code: int) -> None:
        self._http_requests[(method.upper(), int(status_code))] += 1

    def observe_rag(self, *, latency_ms: float, grounded: bool) -> None:
        self._rag_queries_total += 1
        self._rag_latency_ms_sum += max(0.0, float(latency_ms))
        if not grounded:
            self._rag_abstentions_total += 1

    def observe_webhooks(self, count: int) -> None:
        self._webhooks_dispatched_total += max(0, int(count))

    def render_prometheus(
        self,
        *,
        projects_count: int = 0,
        documents_count: int = 0,
        agents_count: int = 0,
        open_gaps_count: int = 0,
    ) -> str:
        uptime = round(time.time() - self._started_at, 2)
        lines = [
            "# HELP contextforge_uptime_seconds Process uptime in seconds.",
            "# TYPE contextforge_uptime_seconds gauge",
            f"contextforge_uptime_seconds {uptime}",
            "# HELP contextforge_projects_total Total configured projects.",
            "# TYPE contextforge_projects_total gauge",
            f"contextforge_projects_total {projects_count}",
            "# HELP contextforge_documents_total Total documents in knowledge base.",
            "# TYPE contextforge_documents_total gauge",
            f"contextforge_documents_total {documents_count}",
            "# HELP contextforge_agents_total Total configured AI agents.",
            "# TYPE contextforge_agents_total gauge",
            f"contextforge_agents_total {agents_count}",
            "# HELP contextforge_open_knowledge_gaps_total Open unanswered knowledge gaps.",
            "# TYPE contextforge_open_knowledge_gaps_total gauge",
            f"contextforge_open_knowledge_gaps_total {open_gaps_count}",
            "# HELP contextforge_rag_queries_total Total RAG and agent queries executed.",
            "# TYPE contextforge_rag_queries_total counter",
            f"contextforge_rag_queries_total {self._rag_queries_total}",
            "# HELP contextforge_rag_abstentions_total Total BR-08 grounded abstentions.",
            "# TYPE contextforge_rag_abstentions_total counter",
            f"contextforge_rag_abstentions_total {self._rag_abstentions_total}",
            "# HELP contextforge_rag_latency_ms_sum Cumulative RAG query latency in milliseconds.",
            "# TYPE contextforge_rag_latency_ms_sum counter",
            f"contextforge_rag_latency_ms_sum {round(self._rag_latency_ms_sum, 2)}",
            "# HELP contextforge_webhooks_dispatched_total Total webhook deliveries attempted.",
            "# TYPE contextforge_webhooks_dispatched_total counter",
            f"contextforge_webhooks_dispatched_total {self._webhooks_dispatched_total}",
            "# HELP contextforge_http_requests_total Total HTTP requests by method and status.",
            "# TYPE contextforge_http_requests_total counter",
        ]
        for (method, status), cnt in sorted(self._http_requests.items()):
            lines.append(f'contextforge_http_requests_total{{method="{method}",status="{status}"}} {cnt}')
        return "\n".join(lines) + "\n"
