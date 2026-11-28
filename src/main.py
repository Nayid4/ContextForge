"""ContextForge v2.0 — Entrypoint FastAPI (Lifespan: Migrations + Seed + Incremental Sync + Middlewares + Routers + MCP)."""

from __future__ import annotations

from contextlib import asynccontextmanager
import logging
import os
from pathlib import Path
import sys
from typing import Any, AsyncGenerator

if sys.platform == "win32":
    import asyncio
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    except Exception:
        pass

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from fastapi.staticfiles import StaticFiles

from application.projects.commands.SyncFilesystemDocs import SyncFilesystemDocsCommand
from domain.users import AuthPrincipal, PermissionAction
from infrastructure.di import DependencyContainer, get_container
from presentation.api.dependencies import require_permission
from presentation.api.middlewares import TraceAndSecurityMiddleware, register_problem_details_handlers
from presentation.api.v1.agents_router import router as agents_router
from presentation.api.v1.auth_router import router as auth_router
from presentation.api.v1.books_router import router as books_router
from presentation.api.v1.bundles_router import router as bundles_router
from presentation.api.v1.collaboration_router import router as collaboration_router
from presentation.api.v1.documents_router import router as documents_router
from presentation.api.v1.integrations_router import router as integrations_router
from presentation.api.v1.openai_compat_router import router as openai_compat_router
from presentation.api.v1.operations_router import router as operations_router
from presentation.api.v1.projects_router import router as projects_router
from presentation.api.v1.rag_chat_router import router as rag_chat_router
from presentation.api.v1.settings_router import router as settings_router
from presentation.api.v1.ws_router import router as ws_router
from presentation.mcp.server import mcp_server
from presentation.web.web_router import web_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("contextforge")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    container: DependencyContainer = get_container()
    bind_host = (os.getenv("UVICORN_HOST") or os.getenv("HOST") or "127.0.0.1").strip()
    if container.settings.env.auth_mode == "local" and bind_host in {"0.0.0.0", "::"}:
        msg = (
            "SEGURIDAD: AUTH_MODE=local con exposición en red (HOST=0.0.0.0) otorga rol Admin sin autenticación. "
            "Usa --host 127.0.0.1 para desarrollo local o activa AUTH_MODE=enterprise_rbac en red/Docker."
        )
        if container.settings.env.strict_bind_check:
            raise RuntimeError(msg)
        logger.warning(msg)
    await container.initialize_runtime()
    try:
        sync_res = await container.mediator.send(SyncFilesystemDocsCommand(project_slug="default"))
        if not sync_res.is_error:
            s = sync_res.value
            logger.info(
                "ContextForge Incremental Sync [default]: added=%d updated=%d unchanged=%d (%.1f ms)",
                s.added_count, s.updated_count, s.unchanged_count, s.duration_ms,
            )
        # Ensure ALL published documents across ALL projects are hydrated in live BM25/Vector indexes on startup
        all_projects = await container.project_repo.list_projects()
        hydrated_docs = 0
        for proj in all_projects:
            pub_docs = await container.doc_repo.list_all(project_slug=proj.slug, only_published=True)
            for doc in pub_docs:
                await container.index_document_callback(doc)
                hydrated_docs += 1
        logger.info("ContextForge Live Index Hydrated: %d published documents across %d project(s)", hydrated_docs, len(all_projects))
    except Exception as exc:
        logger.warning("Initial docs sync warning: %s", exc)

    yield
    await container.shutdown()


def create_app() -> FastAPI:
    container = get_container()
    app = FastAPI(
        title=container.settings.env.app_name,
        description="Plataforma Soberana Docs-as-Code, Búsqueda Híbrida (BM25 + Vectorial), RAG con Citas, Context Bundles y MCP.",
        version=container.settings.env.app_version,
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(container.settings.env.cors_allowed_origins),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(TraceAndSecurityMiddleware)
    register_problem_details_handlers(app)

    @app.get("/health", tags=["Health"])
    @app.get("/health/ready", tags=["Health"])
    async def health_ready() -> dict[str, Any]:
        return {"status": "healthy", "service": "ContextForge", "version": container.settings.env.app_version}

    @app.get("/metrics", tags=["Observability"], response_class=PlainTextResponse)
    async def prometheus_metrics(
        principal: AuthPrincipal = Depends(require_permission(PermissionAction.READ_AUDIT_LOGS)),
    ) -> PlainTextResponse:
        projects = await container.project_repo.list_projects()
        agents = await container.agent_repo.list_all()
        docs_total = 0
        open_gaps = 0
        for p in projects:
            docs_total += len(await container.doc_repo.list_all(project_slug=p.slug))
            open_gaps += len(await container.feedback_repo.list_gaps(p.slug, status="open"))
        body = container.metrics.render_prometheus(
            projects_count=len(projects),
            documents_count=docs_total,
            agents_count=len(agents),
            open_gaps_count=open_gaps,
        )
        return PlainTextResponse(body, media_type="text/plain; version=0.0.4; charset=utf-8")

    static_dir = Path(__file__).resolve().parent / "presentation" / "web" / "shared" / "assets"
    if static_dir.exists():
        app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

    # REST API v1, OpenAI-Compatible Gateway & WebSocket Routers
    app.include_router(auth_router, prefix="/api/v1")
    app.include_router(projects_router, prefix="/api/v1")
    app.include_router(agents_router, prefix="/api/v1")
    app.include_router(operations_router, prefix="/api/v1")
    app.include_router(documents_router, prefix="/api/v1")
    app.include_router(books_router, prefix="/api/v1")
    app.include_router(rag_chat_router, prefix="/api/v1")
    app.include_router(bundles_router, prefix="/api/v1")
    app.include_router(collaboration_router, prefix="/api/v1")
    app.include_router(settings_router, prefix="/api/v1")
    app.include_router(integrations_router, prefix="/api/v1")
    app.include_router(ws_router, prefix="/api/v1")
    app.include_router(openai_compat_router)

    # Universal MCP Server (/mcp)
    app.mount("/mcp", mcp_server.sse_app())

    # Rich Multi-Template Screaming Web UI
    app.include_router(web_router)
    return app


app = create_app()
