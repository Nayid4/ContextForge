"""Frontend Web Router aggregating all UI Screaming modules for ContextForge."""

from __future__ import annotations

from fastapi import APIRouter
from presentation.frontend.modules.context_bundler.routes import router as context_bundler_router
from presentation.frontend.modules.knowledge_docs.routes import router as knowledge_docs_router
from presentation.frontend.modules.projects.routes import router as projects_router
from presentation.frontend.modules.rag_chat.routes import router as rag_chat_router
from presentation.frontend.modules.settings.routes import router as settings_router

web_router = APIRouter()

web_router.include_router(projects_router)
web_router.include_router(knowledge_docs_router)
web_router.include_router(rag_chat_router)
web_router.include_router(context_bundler_router)
web_router.include_router(settings_router)

