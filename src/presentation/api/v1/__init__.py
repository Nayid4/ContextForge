"""API v1 Package."""

from presentation.api.v1.bundles_api import router as bundles_api_router
from presentation.api.v1.catalog_router import router as catalog_router
from presentation.api.v1.chat_router import router as chat_router
from presentation.api.v1.docs_api import router as docs_api_router
from presentation.api.v1.rag_api import router as rag_api_router
from presentation.api.v1.registry_api import router as registry_api_router
from presentation.api.v1.registry_router import router as registry_router
from presentation.api.v1.scaffold_api import router as scaffold_api_router
from presentation.api.v1.search_api import router as search_api_router
from presentation.api.v1.settings_api import router as settings_api_router
from presentation.api.v1.social_router import router as social_router

__all__ = [
    "bundles_api_router",
    "docs_api_router",
    "rag_api_router",
    "registry_api_router",
    "registry_router",
    "scaffold_api_router",
    "search_api_router",
    "settings_api_router",
    "catalog_router",
    "social_router",
    "chat_router",
]
