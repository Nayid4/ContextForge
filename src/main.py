"""ContextForge - Local Knowledge RAG & Docs-as-Code.

Clean Architecture with Decoupled Screaming Frontend and Sovereign Persistence.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
import logging
import time
from typing import AsyncGenerator
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from application.knowledge_docs.commands import IngestDocsCommand
from application.knowledge_docs.handlers import IngestDocsCommandHandler
from infrastructure.database.connection import create_engine_instance, init_db
from presentation.api.dependencies import get_doc_repo, get_lexical_repo, get_vector_repo
from presentation.api.middlewares.problem_details_middleware import register_problem_details_handlers
from fastapi.staticfiles import StaticFiles
from presentation.api.v1.bundles_api import router as bundles_api_router
from presentation.api.v1.catalog_router import router as catalog_router
from presentation.api.v1.chat_router import router as chat_router
from presentation.api.v1.docs_api import router as docs_api_router
from presentation.api.v1.rag_api import router as rag_api_router
from presentation.api.v1.registry_api import router as registry_api_router
from presentation.api.v1.scaffold_api import router as scaffold_api_router
from presentation.api.v1.search_api import router as search_api_router
from presentation.api.v1.settings_api import router as settings_api_router
from presentation.api.v1.llm_settings_api import router as llm_settings_api_router
from presentation.api.v1.social_router import router as social_router
from presentation.frontend.web_router import web_router
from infrastructure.services.fs_watcher import BackgroundDocsWatcher

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("contextforge")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan: initialize database, index docs, and run background watcher."""
    engine = create_engine_instance()
    await init_db(engine, seed=True)

    watcher: BackgroundDocsWatcher | None = None
    # Auto-ingest local ./docs into ChromaDB and BM25 index
    try:
        doc_repo = get_doc_repo()
        vector_repo = get_vector_repo()
        lexical_repo = get_lexical_repo()
        ingest_handler = IngestDocsCommandHandler(doc_repo, vector_repo, lexical_repo)
        indexed = await ingest_handler.handle(IngestDocsCommand(target_directory="./docs"))
        logger.info("ContextForge Docs Ingestion: %d chunks indexados en ChromaDB y BM25", indexed)

        # Initialize and start background file watcher
        watcher = BackgroundDocsWatcher(
            docs_path="./docs",
            debounce_seconds=1.5,
            reindex_callback=lambda slug: ingest_handler.handle(IngestDocsCommand(project_slug=slug)),
        )
        watcher.start()
    except Exception as e:
        logger.warning("Error durante la inicialización de ingesta o watcher: %s", e)

    yield

    if watcher:
        watcher.stop()
    await engine.dispose()


def create_app() -> FastAPI:
    """FastAPI Application Factory."""
    app = FastAPI(
        title="ContextForge",
        description="Local Knowledge RAG & Context Builder con Arquitectura Limpia y Screaming Frontend.",
        version="1.0.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        lifespan=lifespan,
    )

    # 1. CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 2. Timing Header Middleware
    @app.middleware("http")
    async def add_timing_header(request: Request, call_next):  # type: ignore[no-untyped-def]
        start_time = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start_time) * 1000
        response.headers["X-Response-Time-Ms"] = f"{duration_ms:.2f}"
        return response

    # 3. Problem Details RFC 7807 Exception Handlers
    register_problem_details_handlers(app)

    # 4. Static Assets
    from pathlib import Path

    assets_dir = Path("src/presentation/frontend/shared/assets")
    if assets_dir.exists():
        app.mount("/static", StaticFiles(directory=str(assets_dir)), name="static")

    # 5. Mount REST API v1 Routes
    app.include_router(settings_api_router, prefix="/api/v1")
    app.include_router(llm_settings_api_router, prefix="/api/v1")
    app.include_router(docs_api_router, prefix="/api/v1")
    app.include_router(catalog_router, prefix="/api/v1")
    app.include_router(social_router, prefix="/api/v1")
    app.include_router(chat_router, prefix="/api/v1")
    app.include_router(registry_api_router, prefix="/api/v1")
    app.include_router(scaffold_api_router, prefix="/api/v1")
    app.include_router(rag_api_router, prefix="/api/v1")
    app.include_router(bundles_api_router, prefix="/api/v1")
    app.include_router(search_api_router, prefix="/api/v1")

    # 6. Mount Screaming Frontend Routes
    app.include_router(web_router)


    return app


app = create_app()
