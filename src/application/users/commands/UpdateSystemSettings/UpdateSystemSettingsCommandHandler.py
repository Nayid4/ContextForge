from __future__ import annotations
from application.users.commands.UpdateSystemSettings.UpdateSystemSettingsCommand import UpdateSystemSettingsCommand
from domain.common import ErrorOr
from domain.users import ISettingsRepositoryPort, SystemSettingsEntity

class UpdateSystemSettingsCommandHandler:
    def __init__(self, settings_repo: ISettingsRepositoryPort) -> None:
        self._repo = settings_repo

    async def handle(self, request: UpdateSystemSettingsCommand) -> ErrorOr[SystemSettingsEntity]:
        curr = await self._repo.get_settings()
        updated = SystemSettingsEntity(
            id="default",
            active_llm_model=request.active_llm_model if request.active_llm_model is not None else curr.active_llm_model,
            ollama_url=request.ollama_url if request.ollama_url is not None else curr.ollama_url,
            docs_path=request.docs_path if request.docs_path is not None else curr.docs_path,
            embedding_model=request.embedding_model if request.embedding_model is not None else curr.embedding_model,
            temperature=request.temperature if request.temperature is not None else curr.temperature,
            min_grounding_score=request.min_grounding_score if request.min_grounding_score is not None else curr.min_grounding_score,
            enable_dlp_redaction=request.enable_dlp_redaction if request.enable_dlp_redaction is not None else curr.enable_dlp_redaction,
            enable_extractive_fallback=request.enable_extractive_fallback if request.enable_extractive_fallback is not None else curr.enable_extractive_fallback,
        )
        saved = await self._repo.save_settings(updated)
        return ErrorOr.ok(saved)
