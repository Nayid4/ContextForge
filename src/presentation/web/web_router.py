"""Screaming Architecture Web Router aggregating all 7 UI feature modules (0 classes)."""

from __future__ import annotations

from fastapi import APIRouter

from presentation.web.features.agents.routes import router as agents_web_router
from presentation.web.features.auth.routes import router as auth_web_router
from presentation.web.features.context_bundler.routes import router as bundler_router
from presentation.web.features.documents.routes import router as documents_router
from presentation.web.features.editor.routes import router as editor_router
from presentation.web.features.integrations.routes import router as integrations_router
from presentation.web.features.knowledge_health.routes import router as knowledge_health_router
from presentation.web.features.projects.routes import router as projects_router
from presentation.web.features.rag_chat.routes import router as rag_chat_router
from presentation.web.features.settings.routes import router as settings_router

web_router = APIRouter()
web_router.include_router(auth_web_router)
web_router.include_router(documents_router)
web_router.include_router(editor_router)
web_router.include_router(agents_web_router)
web_router.include_router(rag_chat_router)
web_router.include_router(knowledge_health_router)
web_router.include_router(bundler_router)
web_router.include_router(projects_router)
web_router.include_router(settings_router)
web_router.include_router(integrations_router)
