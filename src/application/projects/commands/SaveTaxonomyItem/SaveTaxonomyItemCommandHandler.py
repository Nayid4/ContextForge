from __future__ import annotations
from application.projects.commands.SaveTaxonomyItem.SaveTaxonomyItemCommand import SaveTaxonomyItemCommand
from domain.common import ErrorOr
from domain.projects import IProjectRepositoryPort, TaxonomyItemEntity, TaxonomyKind

class SaveTaxonomyItemCommandHandler:
    def __init__(self, project_repo: IProjectRepositoryPort) -> None:
        self._repo = project_repo

    async def handle(self, request: SaveTaxonomyItemCommand) -> ErrorOr[TaxonomyItemEntity]:
        kind = TaxonomyKind.MODULE if request.kind.strip().lower() == "module" else TaxonomyKind.TAG
        res = TaxonomyItemEntity.create(
            project_slug=request.project_slug,
            name=request.name,
            kind=kind,
            slug=request.slug,
            description=request.description,
            color=request.color,
            icon=request.icon,
        )
        if res.is_error:
            return res
        saved = await self._repo.save_taxonomy(res.value)
        return ErrorOr.ok(saved)
