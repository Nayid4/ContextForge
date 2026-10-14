"""GetDocTemplates query package."""

from application.book_registry.queries.get_doc_templates.handler import (
    GetDocTemplatesHandler,
)
from application.book_registry.queries.get_doc_templates.query import (
    GetDocTemplatesQuery,
)
from application.book_registry.queries.get_doc_templates.response import (
    GetDocTemplatesResponse,
)
from application.book_registry.queries.get_doc_templates.validator import (
    GetDocTemplatesValidator,
)

__all__ = [
    "GetDocTemplatesQuery",
    "GetDocTemplatesResponse",
    "GetDocTemplatesValidator",
    "GetDocTemplatesHandler",
]

