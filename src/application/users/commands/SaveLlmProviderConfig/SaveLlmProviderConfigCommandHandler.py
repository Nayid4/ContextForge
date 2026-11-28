from __future__ import annotations
from application.users.commands.SaveLlmProviderConfig.SaveLlmProviderConfigCommand import SaveLlmProviderConfigCommand
from domain.common import ErrorOr
from domain.ports import ISecretVault
from domain.users import ILlmConfigRepositoryPort, LlmProviderConfigEntity

class SaveLlmProviderConfigCommandHandler:
    def __init__(self, llm_repo: ILlmConfigRepositoryPort, vault: ISecretVault) -> None:
        self._repo = llm_repo
        self._vault = vault

    async def handle(self, request: SaveLlmProviderConfigCommand) -> ErrorOr[dict[str, object]]:
        existing = await self._repo.get_by_provider(request.provider.strip().lower())
        if request.api_key and not request.api_key.startswith("****"):
            enc_key = self._vault.encrypt(request.api_key.strip())
        else:
            enc_key = existing.api_key_encrypted if existing else ""

        entity = LlmProviderConfigEntity(
            provider=request.provider.strip().lower(),
            engine_type=request.engine_type.strip(),
            name=request.name.strip() or request.provider.strip().title(),
            base_url=request.base_url.strip(),
            api_key_encrypted=enc_key,
            default_model=request.default_model.strip(),
            cli_command=request.cli_command.strip(),
            cli_args=request.cli_args.strip(),
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            is_active=request.is_active,
        )
        saved = await self._repo.save(entity)
        if request.is_active:
            await self._repo.set_active(saved.provider)
        plain_preview = self._vault.decrypt(saved.api_key_encrypted) if saved.api_key_encrypted else ""
        return ErrorOr.ok(
            {
                "provider": saved.provider,
                "engine_type": saved.engine_type,
                "name": saved.name,
                "base_url": saved.base_url,
                "api_key_masked": self._vault.mask(plain_preview),
                "default_model": saved.default_model,
                "temperature": saved.temperature,
                "max_tokens": saved.max_tokens,
                "is_active": saved.is_active,
            }
        )
