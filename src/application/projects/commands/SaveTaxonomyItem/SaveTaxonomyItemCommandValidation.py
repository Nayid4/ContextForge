from __future__ import annotations
from application.projects.commands.SaveTaxonomyItem.SaveTaxonomyItemCommand import SaveTaxonomyItemCommand
from domain.common import DomainError

class SaveTaxonomyItemCommandValidation:
    def validate(self, request: SaveTaxonomyItemCommand) -> list[DomainError]:
        errs: list[DomainError] = []
        if request.kind.strip().lower() not in ("module", "tag"):
            errs.append(DomainError.validation("invalid_taxonomy_kind", "El tipo taxonómico debe ser 'module' o 'tag'."))
        if len(request.name.strip()) < 2:
            errs.append(DomainError.validation("invalid_taxonomy_name", "El nombre debe tener al menos 2 caracteres."))
        return errs
