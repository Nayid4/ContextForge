"""Agent-scoped RAG Chat Executor with multi-turn query rewriting, real streaming, grounding & egress sovereignty (BR-19, BR-21)."""

from __future__ import annotations

from dataclasses import asdict
import time
import uuid
from typing import Any, AsyncIterator, Callable, Coroutine, Sequence

from application.rag.queries.HybridSearchDocuments.HybridSearchDocumentsQuery import HybridSearchDocumentsQuery
from application.rag.queries.HybridSearchDocuments.HybridSearchDocumentsQueryHandler import HybridSearchDocumentsQueryHandler
from domain.agents import AgentEntity
from domain.projects import IProjectRepositoryPort
from domain.rag import (
    ChatMessageEntity,
    GroundingPolicy,
    IChatRepositoryPort,
    IFeedbackAndGapRepositoryPort,
    ILLMProviderPort,
    ILexicalIndexPort,
    IVectorStorePort,
    QueryRewriterPolicy,
    SearchHitVO,
    SovereignRoutingPolicy,
)
from domain.users import DlpRedactionStrategy, ISettingsRepositoryPort


class AgentChatExecutor:
    """Executes grounded conversations (single-turn & multi-turn, JSON & live streaming) for a specific AgentEntity."""

    def __init__(
        self,
        *,
        lexical_index: ILexicalIndexPort,
        vector_store: IVectorStorePort,
        project_repo: IProjectRepositoryPort,
        settings_repo: ISettingsRepositoryPort,
        fallback_llm: ILLMProviderPort,
        llm_resolver: Callable[[AgentEntity], Coroutine[Any, Any, tuple[ILLMProviderPort, str]]],
        chat_repo: IChatRepositoryPort | None = None,
        feedback_repo: IFeedbackAndGapRepositoryPort | None = None,
        metrics_callback: Callable[[float, bool], None] | None = None,
        allow_public_cli_agents: bool = False,
    ) -> None:
        self._search = HybridSearchDocumentsQueryHandler(lexical_index, vector_store)
        self._project_repo = project_repo
        self._settings_repo = settings_repo
        self._fallback_llm = fallback_llm
        self._llm_resolver = llm_resolver
        self._chat_repo = chat_repo
        self._feedback_repo = feedback_repo
        self._metrics_cb = metrics_callback
        self._allow_public_cli_agents = allow_public_cli_agents

    @staticmethod
    def _is_conversational_greeting_or_help(question: str) -> bool:
        import re as _re
        cleaned = _re.sub(r"[^\w\sáéíóúüñ]", " ", question.strip().lower())
        tokens = [t for t in cleaned.split() if t]
        if not tokens:
            return True
        joined = " ".join(tokens)
        exact_openers = {
            "hola", "hols", "holaa", "holaaa", "holi", "buenas", "buenos dias", "buenos días",
            "buenas tardes", "buenas noches", "saludos", "hello", "hi", "hey", "ayuda", "help",
            "explicame", "explícame", "hola explicame", "hola explícame", "que haces", "qué haces",
            "que puedes hacer", "qué puedes hacer", "quien eres", "quién eres", "como me ayudas",
            "cómo me ayudas", "me puedes ayudar", "como funciona", "cómo funciona", "buenas explicame",
        }
        if joined in exact_openers:
            return True
        greeting_words = {"hola", "hols", "holaa", "holi", "buenas", "buenos", "saludos", "hello", "hi", "hey"}
        generic_help_words = {"explicame", "explícame", "ayuda", "ayudame", "ayúdame", "help", "por", "favor", "dias", "días", "tardes", "noches"}
        if len(tokens) <= 4 and tokens[0] in greeting_words and all(t in greeting_words | generic_help_words for t in tokens):
            return True
        return False

    @staticmethod
    def _build_welcome_reply(agent: AgentEntity) -> str:
        base = (agent.welcome_message or f"¡Hola! Soy {agent.name}.").strip()
        if agent.suggested_questions:
            qs = "\n".join(f"- {q}" for q in agent.suggested_questions[:4])
            return f"{base}\n\nPuedes empezar preguntándome, por ejemplo:\n{qs}"
        return f"{base}\n\nEscríbeme una consulta concreta sobre la documentación de este proyecto para ayudarte con citas verificables."

    async def _prepare_turn(
        self,
        *,
        agent: AgentEntity,
        question: str,
        ranking: str,
        mode: str,
        conversation_history: Sequence[tuple[str, str]] | None,
    ) -> dict[str, Any]:
        proj = await self._project_repo.get_by_slug(agent.project_slug)
        sovereign = bool(proj.sovereign_only) if proj else False
        settings = await self._settings_repo.get_settings()

        rewritten_query = QueryRewriterPolicy.rewrite_with_history(question, conversation_history)
        history_block = QueryRewriterPolicy.format_conversation_history(conversation_history)

        if self._is_conversational_greeting_or_help(question):
            return {
                "kind": "greeting",
                "sovereign": sovereign,
                "settings": settings,
                "rewritten_query": rewritten_query,
                "answer": self._build_welcome_reply(agent),
                "hits": [],
                "retrieved_inspector": [],
            }

        single_module = agent.allowed_modules[0] if len(agent.allowed_modules) == 1 else None
        hits_res = await self._search.handle(
            HybridSearchDocumentsQuery(
                query=rewritten_query,
                project_slug=agent.project_slug,
                top_k=max(agent.top_k * 2, 10) if len(agent.allowed_modules) > 1 else agent.top_k,
                mode=mode,
                ranking=ranking,
                module_name=single_module,
                include_drafts=agent.includes_drafts,
            )
        )
        hits: list[SearchHitVO] = hits_res.value if not hits_res.is_error else []
        if len(agent.allowed_modules) > 1:
            allowed_mod_set = set(agent.allowed_modules)
            hits = [h for h in hits if h.module_name in allowed_mod_set][: agent.top_k]

        retrieved_inspector = [
            {
                "chunk_id": h.chunk_id,
                "path": h.path,
                "title": h.title,
                "module_name": h.module_name,
                "headers": list(h.headers),
                "score": h.score,
                "source_type": h.source_type,
                "excerpt": h.text[:260],
            }
            for h in hits
        ]

        if not GroundingPolicy.has_sufficient_evidence(hits, min_score=agent.min_grounding_score):
            return {
                "kind": "abstention",
                "sovereign": sovereign,
                "settings": settings,
                "rewritten_query": rewritten_query,
                "answer": GroundingPolicy.ABSTENTION_MESSAGE,
                "hits": hits,
                "retrieved_inspector": retrieved_inspector,
            }

        citations = GroundingPolicy.build_citations(hits)
        prompt = history_block + GroundingPolicy.build_grounded_prompt(question, hits)
        sys_prompt = agent.system_prompt
        if agent.topic_boundaries:
            sys_prompt = f"{sys_prompt}\nLímites de tema permitidos: {agent.topic_boundaries}"

        chosen_llm, eff_model = await self._llm_resolver(agent)
        degraded = False
        if agent.visibility == "public" and chosen_llm.engine_type == "local_cli" and not self._allow_public_cli_agents:
            chosen_llm = self._fallback_llm
            eff_model = "extractive-v2"
            degraded = True

        egress_dest = SovereignRoutingPolicy.classify_egress(
            provider_engine_type=chosen_llm.engine_type,
            base_url=chosen_llm.base_url,
            provider_name=chosen_llm.provider_name,
        )
        sov_check = SovereignRoutingPolicy.check_provider_allowed(
            project_sovereign_only=sovereign,
            provider_engine_type=chosen_llm.engine_type,
            base_url=chosen_llm.base_url,
            provider_name=chosen_llm.provider_name,
        )
        if sov_check.is_error:
            chosen_llm = self._fallback_llm
            eff_model = "extractive-v2"
            egress_dest = "local"
            degraded = True
        elif SovereignRoutingPolicy.requires_dlp(
            dlp_enabled=settings.enable_dlp_redaction,
            provider_engine_type=chosen_llm.engine_type,
            base_url=chosen_llm.base_url,
            provider_name=chosen_llm.provider_name,
        ):
            prompt, _ = DlpRedactionStrategy.redact(prompt, redact_emails=True)

        return {
            "kind": "generate",
            "sovereign": sovereign,
            "settings": settings,
            "rewritten_query": rewritten_query,
            "hits": hits,
            "retrieved_inspector": retrieved_inspector,
            "citations": citations,
            "prompt": prompt,
            "sys_prompt": sys_prompt,
            "chosen_llm": chosen_llm,
            "eff_model": eff_model,
            "egress_dest": egress_dest,
            "degraded": degraded,
        }

    async def execute(
        self,
        *,
        agent: AgentEntity,
        question: str,
        ranking: str = "rrf",
        mode: str = "hybrid",
        session_id: str | None = None,
        user_id: str | None = None,
        conversation_history: Sequence[tuple[str, str]] | None = None,
    ) -> dict[str, Any]:
        t0 = time.perf_counter()
        prep = await self._prepare_turn(
            agent=agent,
            question=question,
            ranking=ranking,
            mode=mode,
            conversation_history=conversation_history,
        )
        if prep["kind"] == "greeting":
            elapsed = round((time.perf_counter() - t0) * 1000.0, 2)
            return {
                "session_id": session_id,
                "agent_id": agent.agent_id,
                "agent_version": agent.current_version,
                "agent_slug": agent.slug,
                "agent_name": agent.name,
                "project_slug": agent.project_slug,
                "openai_model_id": agent.openai_model_id,
                "visibility": agent.visibility,
                "egress_destination": "local",
                "rewritten_query": prep["rewritten_query"],
                "answer": prep["answer"],
                "grounded": True,
                "degraded_fallback": False,
                "sovereign_mode": prep["sovereign"],
                "provider_name": agent.llm_provider or "active_default",
                "model_name": agent.llm_model or prep["settings"].active_llm_model,
                "tokens_used": max(1, len(prep["answer"].split()) * 2),
                "citations": [],
                "retrieved_chunks": [],
                "latency_ms": elapsed,
            }

        if prep["kind"] == "abstention":
            elapsed = round((time.perf_counter() - t0) * 1000.0, 2)
            if self._feedback_repo is not None:
                safe_q, _ = DlpRedactionStrategy.redact(question, redact_emails=True)
                await self._feedback_repo.record_gap(
                    project_slug=agent.project_slug,
                    agent_slug=agent.slug,
                    question=safe_q,
                )
            if self._metrics_cb is not None:
                self._metrics_cb(elapsed, False)
            return {
                "session_id": session_id,
                "agent_id": agent.agent_id,
                "agent_version": agent.current_version,
                "agent_slug": agent.slug,
                "agent_name": agent.name,
                "project_slug": agent.project_slug,
                "openai_model_id": agent.openai_model_id,
                "visibility": agent.visibility,
                "egress_destination": "local",
                "rewritten_query": prep["rewritten_query"],
                "answer": prep["answer"],
                "grounded": False,
                "degraded_fallback": False,
                "sovereign_mode": prep["sovereign"],
                "provider_name": "abstention_guard",
                "model_name": "none",
                "tokens_used": 0,
                "citations": [],
                "retrieved_chunks": prep["retrieved_inspector"],
                "latency_ms": elapsed,
            }

        chosen_llm: ILLMProviderPort = prep["chosen_llm"]
        eff_model: str = prep["eff_model"]
        egress_dest: str = prep["egress_dest"]
        degraded: bool = prep["degraded"]
        try:
            answer_text = await chosen_llm.generate(prep["prompt"], system_prompt=prep["sys_prompt"], model=eff_model or None)
            used_provider = chosen_llm.provider_name
        except Exception:
            if not prep["settings"].enable_extractive_fallback:
                raise
            answer_text = await self._fallback_llm.generate(prep["prompt"], system_prompt=prep["sys_prompt"])
            used_provider = self._fallback_llm.provider_name
            eff_model = "extractive-v2"
            egress_dest = "local"
            degraded = True

        hits: list[SearchHitVO] = prep["hits"]
        citations = prep["citations"]
        answer_text, stripped_citations = GroundingPolicy.validate_citations(answer_text, hits)
        elapsed = round((time.perf_counter() - t0) * 1000.0, 2)
        if self._metrics_cb is not None:
            self._metrics_cb(elapsed, True)
        est_tokens = max(1, (len(question.split()) + len(answer_text.split())) * 2)
        chunk_ids = tuple(h.chunk_id for h in hits)
        persisted_session_id: str | None = session_id

        if self._chat_repo is not None:
            sess = await self._chat_repo.get_or_create_session(
                session_id=session_id,
                project_slug=agent.project_slug,
                user_id=user_id,
                agent_id=agent.agent_id,
                agent_version=agent.current_version,
            )
            persisted_session_id = sess.session_id
            await self._chat_repo.append_message(
                ChatMessageEntity(id=str(uuid.uuid4()), session_id=sess.session_id, role="user", content=question.strip())
            )
            await self._chat_repo.append_message(
                ChatMessageEntity(
                    id=str(uuid.uuid4()),
                    session_id=sess.session_id,
                    role="assistant",
                    content=answer_text,
                    citations=citations,
                    latency_ms=elapsed,
                    model_name=eff_model,
                    tokens_used=est_tokens,
                    retrieved_chunk_ids=chunk_ids,
                )
            )

        return {
            "session_id": persisted_session_id,
            "agent_id": agent.agent_id,
            "agent_version": agent.current_version,
            "agent_slug": agent.slug,
            "agent_name": agent.name,
            "project_slug": agent.project_slug,
            "openai_model_id": agent.openai_model_id,
            "visibility": agent.visibility,
            "egress_destination": egress_dest,
            "rewritten_query": prep["rewritten_query"],
            "answer": answer_text,
            "grounded": True,
            "degraded_fallback": degraded,
            "sovereign_mode": prep["sovereign"],
            "provider_name": used_provider,
            "model_name": eff_model,
            "tokens_used": est_tokens,
            "citations": [asdict(c) for c in citations],
            "stripped_citations": list(stripped_citations),
            "retrieved_chunks": prep["retrieved_inspector"],
            "latency_ms": elapsed,
        }

    async def stream_execute(
        self,
        *,
        agent: AgentEntity,
        question: str,
        ranking: str = "rrf",
        mode: str = "hybrid",
        conversation_history: Sequence[tuple[str, str]] | None = None,
    ) -> AsyncIterator[str]:
        """Yields true token-by-token chunks directly from chosen_llm.stream_generate() with automatic fallback."""
        prep = await self._prepare_turn(
            agent=agent,
            question=question,
            ranking=ranking,
            mode=mode,
            conversation_history=conversation_history,
        )
        if prep["kind"] in ("greeting", "abstention"):
            yield str(prep["answer"])
            return

        chosen_llm: ILLMProviderPort = prep["chosen_llm"]
        eff_model: str = prep["eff_model"]
        hits: list[SearchHitVO] = prep["hits"]
        yielded_any = False
        pending = ""
        try:
            async for tok in chosen_llm.stream_generate(prep["prompt"], system_prompt=prep["sys_prompt"], model=eff_model or None):
                if not tok:
                    continue
                pending += tok
                while pending:
                    open_idx = pending.find("[")
                    if open_idx == -1:
                        yielded_any = True
                        yield pending
                        pending = ""
                        break
                    if open_idx > 0:
                        yielded_any = True
                        yield pending[:open_idx]
                        pending = pending[open_idx:]
                    close_idx = pending.find("]")
                    if close_idx == -1:
                        if len(pending) > 256:
                            yielded_any = True
                            yield pending
                            pending = ""
                        break
                    span = pending[: close_idx + 1]
                    pending = pending[close_idx + 1 :]
                    validated_span, _ = GroundingPolicy.validate_citations(span, hits)
                    if validated_span:
                        yielded_any = True
                        yield validated_span
            if pending:
                validated_tail, _ = GroundingPolicy.validate_citations(pending, hits)
                if validated_tail:
                    yielded_any = True
                    yield validated_tail
        except Exception:
            if yielded_any or not prep["settings"].enable_extractive_fallback:
                raise
            fallback_text = await self._fallback_llm.generate(prep["prompt"], system_prompt=prep["sys_prompt"])
            validated_fb, _ = GroundingPolicy.validate_citations(fallback_text, hits)
            yield validated_fb
