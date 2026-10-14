"""Handler for GetDocTemplatesQuery."""

from __future__ import annotations

from application.book_registry.queries.get_doc_templates.query import (
    GetDocTemplatesQuery,
)
from application.book_registry.queries.get_doc_templates.response import (
    GetDocTemplatesResponse,
)
from application.book_registry.queries.get_doc_templates.validator import (
    GetDocTemplatesValidator,
)
from core.templates.blueprints import get_all_blueprints


class GetDocTemplatesHandler:
    """Retrieves standardized blueprints."""

    def __init__(self) -> None:
        self._validator = GetDocTemplatesValidator()

    async def handle(self, query: GetDocTemplatesQuery) -> GetDocTemplatesResponse:
        self._validator.validate(query)
        templates_list = []
        for bp in get_all_blueprints():
            if query.category and bp.category.lower() != query.category.lower():
                continue
            templates_list.append({
                "id": bp.id,
                "name": bp.name,
                "category": bp.category,
                "description": bp.description,
                "default_module": bp.default_module,
                "default_tags": bp.default_tags,
                "template": bp.markdown_template,
            })
        return GetDocTemplatesResponse(templates=templates_list)
