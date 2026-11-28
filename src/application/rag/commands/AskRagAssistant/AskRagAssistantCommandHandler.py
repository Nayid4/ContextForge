from __future__ import annotations
import time
import uuid
from application.rag.commands.AskRagAssistant.AskRagAssistantCommand import AskRagAssistantCommand
from application.rag.queries.HybridSearchDocuments.HybridSearchDocumentsQuery import HybridSearchDocumentsQuery
from application.rag.queries.HybridSearchDocuments.HybridSearchDocumentsQueryHandler import HybridSearchDocumentsQueryHandler
from domain.common import ErrorOr
from domain.projects import IProjectRepositoryPort
from domain.rag import (
    ChatMessageEntity,
    GroundingPolicy,
    IChatRepositoryPort,
    ILLMProviderPort,
    ILexicalIndexPort,
    IVectorStorePort,
    RagAnswerVO,
    SovereignRoutingPolicy,
)
from domain.users import DlpRedactionStrategy, ISettingsRepositoryPort

class AskRagAssistantCommandHandler:
    def __init__(
        self,
        lexical_index: ILexicalIndexPort,
        vector_store: IVectorStorePort,
        primary_llm: ILLMProviderPort,
        fallback_llm: ILLMProviderPort,
        project_repo: IProjectRepositoryPort,
        settings_repo: ISettingsRepositoryPort,
        chat_repo: IChatRepositoryPort,
    ) -> None:
        self._search_handler = HybridSearchDocumentsQueryHandler(lexical_index, vector_store)
        self._primary_llm = primary_llm
        self._fallback_llm = fallback_llm
        self._project_repo = project_repo
        self._settings_repo = settings_repo
        self._chat_repo = chat_repo

    async def handle(self, request: AskRagAssistantCommand) -> ErrorOr[RagAnswerVO]:
        t0 = time.perf_counter()
        proj = await self._project_repo.get_by_slug(request.project_slug)
        sovereign = bool(proj.sovereign_only) if proj else False
        settings = await self._settings_repo.get_settings()

        hits_res = await self._search_handler.handle(
            HybridSearchDocumentsQuery(
                query=request.question,
                project_slug=request.project_slug,
                top_k=request.top_k,
                mode=request.mode,
                ranking=request.ranking,
                module_name=request.module_name,
                include_drafts=False,
            )
        )
        if hits_res.is_error:
            return ErrorOr.fail(*hits_res.errors)
        hits = hits_res.value
        if request.book_id:
            hits = [h for h in hits if h.doc_id == request.book_id or h.path == request.book_id] or hits

        session = await self._chat_repo.get_or_create_session(
            request.session_id, request.project_slug, book_id=request.book_id, user_id=request.user_id
        )
        await self._chat_repo.append_message(
            ChatMessageEntity(id=str(uuid.uuid4()), session_id=session.session_id, role="user", content=request.question.strip())
        )

        # Conversational greeting fast-path (friendly guidance without relaxing BR-08 factual abstention)
        q_norm = request.question.strip().lower().rstrip("!.?,;:")
        if q_norm in {"hola", "buenas", "buenos dias", "buenos días", "buenas tardes", "buenas noches", "hello", "hi", "hey", "ayuda", "help"}:
            greeting_ans = (
                f"¡Hola! Soy el asistente de conocimiento de **ContextForge** para el proyecto `{request.project_slug}`.\n\n"
                "Puedo responder preguntas técnicas, resumir arquitectura, reglas de negocio o especificaciones basándome en tus documentos publicados con citas verificables.\n\n"
                "Prueba preguntarme por el nombre de algún documento, regla de negocio o módulo del proyecto."
            )
            elapsed = round((time.perf_counter() - t0) * 1000.0, 2)
            ans_vo = RagAnswerVO(
                question=request.question,
                answer=greeting_ans,
                citations=(),
                provider_name=self._primary_llm.provider_name,
                model_name=getattr(self._primary_llm, "active_model_name", settings.active_llm_model),
                grounded=True,
                sovereign_mode=sovereign,
                degraded_fallback=False,
                latency_ms=elapsed,
                session_id=session.session_id,
            )
            await self._chat_repo.append_message(
                ChatMessageEntity(
                    id=str(uuid.uuid4()),
                    session_id=session.session_id,
                    role="assistant",
                    content=ans_vo.answer,
                    citations=(),
                    latency_ms=elapsed,
                )
            )
            return ErrorOr.ok(ans_vo)

        # BR-08 Controlled Abstention when evidence < min_grounding_score
        if not GroundingPolicy.has_sufficient_evidence(hits, min_score=settings.min_grounding_score):
            elapsed = round((time.perf_counter() - t0) * 1000.0, 2)
            ans_vo = RagAnswerVO(
                question=request.question,
                answer=GroundingPolicy.ABSTENTION_MESSAGE,
                citations=(),
                provider_name="abstention_guard",
                model_name="none",
                grounded=False,
                sovereign_mode=sovereign,
                degraded_fallback=False,
                latency_ms=elapsed,
                session_id=session.session_id,
            )
            await self._chat_repo.append_message(
                ChatMessageEntity(
                    id=str(uuid.uuid4()),
                    session_id=session.session_id,
                    role="assistant",
                    content=ans_vo.answer,
                    citations=(),
                    latency_ms=elapsed,
                )
            )
            return ErrorOr.ok(ans_vo)

        citations = GroundingPolicy.build_citations(hits)
        prompt = GroundingPolicy.build_grounded_prompt(request.question, hits)

        # Enforce BR-13 / BR-21 Egress-Based Sovereign Routing & DLP Redaction (covers cloud CLIs too)
        chosen_llm = self._primary_llm
        degraded = False
        sov_check = SovereignRoutingPolicy.check_provider_allowed(
            project_sovereign_only=sovereign,
            provider_engine_type=chosen_llm.engine_type,
            base_url=chosen_llm.base_url,
            provider_name=chosen_llm.provider_name,
        )
        if sov_check.is_error:
            chosen_llm = self._fallback_llm
            degraded = True
        elif SovereignRoutingPolicy.requires_dlp(
            dlp_enabled=settings.enable_dlp_redaction,
            provider_engine_type=chosen_llm.engine_type,
            base_url=chosen_llm.base_url,
            provider_name=chosen_llm.provider_name,
        ):
            prompt, _ = DlpRedactionStrategy.redact(prompt, redact_emails=True)

        try:
            answer_text = await chosen_llm.generate(
                prompt,
                system_prompt=request.system_prompt,
                model=None,
            )
            used_provider = chosen_llm.provider_name
            used_model = getattr(chosen_llm, "active_model_name", settings.active_llm_model)
        except Exception:
            if not settings.enable_extractive_fallback:
                raise
            answer_text = await self._fallback_llm.generate(prompt, system_prompt=request.system_prompt)
            used_provider = self._fallback_llm.provider_name
            used_model = "extractive-v2"
            degraded = True

        answer_text, _ = GroundingPolicy.validate_citations(answer_text, hits)

        elapsed = round((time.perf_counter() - t0) * 1000.0, 2)
        ans_vo = RagAnswerVO(
            question=request.question,
            answer=answer_text,
            citations=citations,
            provider_name=used_provider,
            model_name=used_model,
            grounded=True,
            sovereign_mode=sovereign,
            degraded_fallback=degraded,
            latency_ms=elapsed,
            session_id=session.session_id,
        )
        await self._chat_repo.append_message(
            ChatMessageEntity(
                id=str(uuid.uuid4()),
                session_id=session.session_id,
                role="assistant",
                content=answer_text,
                citations=citations,
                latency_ms=elapsed,
                model_name=used_model,
                tokens_used=max(1, (len(request.question.split()) + len(answer_text.split())) * 2),
                retrieved_chunk_ids=tuple(h.chunk_id for h in hits),
            )
        )
        return ErrorOr.ok(ans_vo)
