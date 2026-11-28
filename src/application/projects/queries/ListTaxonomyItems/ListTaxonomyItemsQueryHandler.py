from __future__ import annotations
from application.projects.queries.ListTaxonomyItems.ListTaxonomyItemsQuery import ListTaxonomyItemsQuery
from domain.common import ErrorOr
from domain.projects import IProjectRepositoryPort, TaxonomyItemEntity, TaxonomyKind

class ListTaxonomyItemsQueryHandler:
    def __init__(self, project_repo: IProjectRepositoryPort) -> None:
        self._repo = project_repo

    async def handle(self, request: ListTaxonomyItemsQuery) -> ErrorOr[list[TaxonomyItemEntity]]:
        parsed_kind: TaxonomyKind | None = None
        if request.kind:
            parsed_kind = TaxonomyKind.MODULE if request.kind.lower() == "module" else TaxonomyKind.TAG
        items = await self._repo.list_taxonomy(request.project_slug, kind=parsed_kind, search=request.search)
        return ErrorOr.ok(items)
