"""Handler for AskProjectContextCommand using Universal LLM/CLI Engine and Hybrid Search."""

from __future__ import annotations

import logging

from application.chat.commands.ask_project_context.command import AskProjectContextCommand
from application.chat.commands.ask_project_context.response import (
    AskProjectContextResponse,
    SourceSnippetDTO,
)
from application.chat.commands.ask_project_context.validator import AskProjectContextValidator
from application.rag_engine.services.hybrid_searcher import HybridSearchService
from domain.llm.entities import LLMProvider
from domain.llm.repositories import ILLMConfigRepository
from infrastructure.external.llm.llm_factory import LLMFactory

logger = logging.getLogger("application.chat.commands.ask_project_context")


class AskProjectContextCommandHandler:
    """Orchestrates hybrid retrieval and dispatches inference to the active LLM or CLI engine."""

    def __init__(
        self,
        config_repo: ILLMConfigRepository,
        hybrid_searcher: HybridSearchService,
    ) -> None:
        self._config_repo = config_repo
        self._searcher = hybrid_searcher

    async def handle(self, command: AskProjectContextCommand) -> AskProjectContextResponse:
        AskProjectContextValidator.validate(command)

        retrieved_chunks = await self._searcher.search(
            query=command.user_query,
            project_slug=command.project_slug,
            top_k=5,
        )

        if command.module_filter:
            mod_clean = command.module_filter.strip().lower()
            filtered = [c for c in retrieved_chunks if mod_clean in c.file_path.lower()]
            if filtered:
                retrieved_chunks = filtered

        context_lines: list[str] = []
        sources: list[SourceSnippetDTO] = []
        seen_paths: set[str] = set()

        for chunk in retrieved_chunks:
            header_label = " > ".join(chunk.header_hierarchy) if chunk.header_hierarchy else ""
            title = header_label or chunk.file_path
            loc = header_label or "Cuerpo"
            context_lines.append(
                f"--- DOCUMENTO: {title} ({chunk.file_path} - {loc}) ---\n{chunk.text}\n"
            )
            if chunk.file_path not in seen_paths:
                seen_paths.add(chunk.file_path)
                sources.append(
                    SourceSnippetDTO(
                        document_title=title,
                        file_path=chunk.file_path,
                        location=loc,
                        excerpt=chunk.text[:160],
                    )
                )

        system_prompt = (
            f"Eres el asistente técnico oficial del proyecto '{command.project_slug}'.\n"
            "Responde a la pregunta del desarrollador basándote EXCLUSIVAMENTE en la siguiente documentación.\n"
            "Cita siempre el archivo o anexo de donde obtuviste la información usando [ruta/archivo.md].\n"
            "Si el contexto no tiene la respuesta, declara que no se especifica en la documentación actual.\n\n"
            "DOCUMENTACIÓN DISPONIBLE:\n" + "\n".join(context_lines)
        )

        target_config = None
        if command.provider_override:
            try:
                prov = LLMProvider(command.provider_override)
                target_config = await self._config_repo.get_by_provider(prov)
            except ValueError:
                target_config = None

        if target_config is None:
            target_config = await self._config_repo.get_active()

        client = LLMFactory.create_client(target_config)
        try:
            answer = await client.generate(
                prompt=command.user_query,
                system=system_prompt,
                model=target_config.default_model,
            )
        except Exception as exc:
            logger.error(
                "Error generating answer with %s (%s): %s",
                target_config.provider.value,
                target_config.engine_type.value,
                exc,
                exc_info=True,
            )
            answer = (
                f"⚠️ **Error al consultar el motor de IA '{target_config.provider.value}'**: {str(exc)}\n\n"
                f"Verifica la configuración de API Key y modelo en la pestaña de Ajustes de IA."
            )

        return AskProjectContextResponse(
            answer=answer,
            engine_used=f"{target_config.provider.value} ({target_config.engine_type.value})",
            sources=sources,
        )

