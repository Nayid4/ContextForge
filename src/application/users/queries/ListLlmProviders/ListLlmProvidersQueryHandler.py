from __future__ import annotations
from application.users.queries.ListLlmProviders.ListLlmProvidersQuery import ListLlmProvidersQuery
from domain.common import ErrorOr
from domain.ports import ISecretVault
from domain.users import ILlmConfigRepositoryPort

class ListLlmProvidersQueryHandler:
    def __init__(self, llm_repo: ILlmConfigRepositoryPort, vault: ISecretVault) -> None:
        self._repo = llm_repo
        self._vault = vault

    async def handle(self, request: ListLlmProvidersQuery) -> ErrorOr[list[dict[str, object]]]:
        items = await self._repo.list_all()
        out: list[dict[str, object]] = []
        for item in items:
            if request.only_active and not item.is_active:
                continue
            dec = self._vault.decrypt(item.api_key_encrypted) if item.api_key_encrypted else ""
            out.append(
                {
                    "provider": item.provider,
                    "engine_type": item.engine_type,
                    "name": item.name,
                    "base_url": item.base_url,
                    "api_key_masked": self._vault.mask(dec),
                    "has_api_key": bool(dec),
                    "default_model": item.default_model,
                    "cli_command": item.cli_command,
                    "cli_args": item.cli_args,
                    "temperature": item.temperature,
                    "max_tokens": item.max_tokens,
                    "egress_class": item.egress_class or "cloud",
                    "is_active": item.is_active,
                }
            )
        return ErrorOr.ok(out)
