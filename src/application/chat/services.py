"""Scoped Document Chat Service with Zero-RAG Bypass and Scoped ChromaDB Search."""

from __future__ import annotations

from typing import Any
from domain.chat.entities import DocumentSourceRef


class ScopedChatService:
    """Orchestrates focused conversation confined strictly to a single document and its attachments."""

    def __init__(self, vector_store: Any, ollama_client: Any) -> None:
        self.vector_store = vector_store
        self.ollama = ollama_client

    async def answer_question(
        self,
        library_id: str,
        book_id: str,
        raw_markdown: str,
        user_query: str,
        history: list[dict[str, str]] | None = None,
    ) -> dict[str, Any]:
        """Answer question with Zero-RAG Bypass when <= 32k chars, or Scoped ChromaDB search when larger."""
        clean_markdown = raw_markdown.strip()

        # Build conversational context from history if provided
        history_context = ""
        if history:
            turns = []
            for h in history:
                role_label = "Desarrollador" if h.get("role") == "user" else "Copiloto IA"
                content = (h.get("content") or "").strip()
                if content:
                    turns.append(f"{role_label}: {content}")
            if turns:
                history_context = "\n\nHISTORIAL DE DIÁLOGO PREVIO ENTRE DESARROLLADOR Y COPILOTO:\n" + "\n".join(turns) + "\n"

        prompt_with_history = f"{history_context}\nPETICIÓN ACTUAL DEL DESARROLLADOR:\n{user_query}" if history_context else user_query

        # 0. Nuevo Documento en Blanco o sin contenido en memoria:
        if not clean_markdown:
            is_new_doc = book_id in ("doc", "nuevo", "draft", "especificacion", "") or not book_id.endswith(".md")
            has_drafting_intent = bool(history) or any(
                k in user_query.lower()
                for k in ["genera", "redacta", "crea", "diseña", "flujo", ".md", "blueprint", "template", "ayuda", "copiloto"]
            )

            if not is_new_doc and not has_drafting_intent:
                hits = await self.vector_store.search_scoped(
                    library_id=library_id,
                    book_id=book_id,
                    query=user_query,
                    limit=5,
                )
                if not hits:
                    return {
                        "answer": "El documento no contiene esa información.",
                        "sources": [],
                    }
                return await self._answer_from_scoped_hits(library_id, book_id, prompt_with_history, hits)

            system_prompt = (
                f"Eres el Copiloto Técnico de Documentación e Ingeniería de ContextForge para el proyecto '{library_id}'.\n"
                "El desarrollador está redactando un nuevo documento técnico o especificando la arquitectura de un flujo.\n"
                "Tu misión es ayudarle a estructurar, redactar, proponer reglas técnicas y enriquecer el documento con el contexto que él te proporcione.\n\n"
                "DIRECTIVAS OBLIGATORIAS:\n"
                "1. CONTINUIDAD CONVERSACIONAL: Incorpora siempre los detalles, modelos, reglas y directivas que el desarrollador te haya compartido en los mensajes previos.\n"
                "2. REDACCIÓN Y ESTRUCTURA: Redacta especificaciones con enfoque Docs-as-Code: propósito, reglas de negocio, contratos de APIs/eventos y políticas de resiliencia.\n"
                "3. DIAGRAMAS MERMAID: Proporciona diagramas Mermaid.js precisos (graph TD, sequenceDiagram) para ilustrar los flujos descritos.\n"
                "4. GENERACIÓN DE ARCHIVOS .MD: Si el usuario te solicita un .md o una especificación completa (ej. 'dame un .md con este flujo'), genera un documento Markdown técnico completo con Frontmatter YAML (title, module, tags, author, date, version), secciones estructuradas, diagramas y reglas operativas, listo para ser copiado o descargado.\n"
                "5. CALIDAD TÉCNICA: Propón siempre políticas de reintentos con jitter, idempotencia, códigos de error HTTP/gRPC y consideraciones de concurrencia.\n"
            )
            ans = await self.ollama.generate(prompt=prompt_with_history, system=system_prompt)
            return {
                "answer": ans,
                "sources": [
                    DocumentSourceRef(
                        document_path=book_id,
                        location="Copiloto de Redacción (Nuevo Documento)",
                        excerpt="Asistente de Documentación Técnica local",
                    ).to_dict()
                ],
            }

        # 1. Zero-RAG Bypass: Inyecta el documento completo si mide <= 32.000 caracteres (~8k tokens)
        if len(clean_markdown) <= 32000 and clean_markdown:
            system_prompt = (
                f"Eres el Copiloto Técnico de Documentación e Ingeniería de ContextForge para el documento '{book_id}' del proyecto '{library_id}'.\n"
                "Tu objetivo es resolver dudas sobre el documento o AYUDAR AL DESARROLLADOR A DOCUMENTARLO, REDACTARLO Y REFINARLO con excelencia técnica.\n\n"
                f"CONTEXTO ACTUAL DEL DOCUMENTO:\n{clean_markdown}\n\n"
                "DIRECTIVAS OBLIGATORIAS:\n"
                "1. CONTINUIDAD CONVERSACIONAL: Considera todos los requerimientos y decisiones técnicas conversadas en el historial previo.\n"
                "2. CONSULTAS DE HECHOS: Si el usuario consulta hechos específicos y la información está en el texto, responde concisamente citando el documento. Si pregunta un hecho puntual que no está en el texto, indícalo con claridad.\n"
                "3. ASISTENCIA EN DOCUMENTACIÓN (COPILOTO): Si el usuario te pide ayuda para documentar, estructurar reglas, diseñar flujos o redactar secciones a partir de un contexto que él te da, actúa como Arquitecto de Software: propón estructuras claras, reglas técnicas precisas y casos de error.\n"
                "4. DIAGRAMAS MERMAID: Genera diagramas técnicos válidos (graph TD o sequenceDiagram) cuando se describan flujos, orquestación o arquitecturas.\n"
                "5. GENERACIÓN DE ARCHIVOS .MD: Si el usuario te pide un .md, una especificación completa o exportar el flujo, genera un documento Markdown técnico exhaustivo y completo con Frontmatter YAML (title, module, tags, author, date, version), secciones detalladas, diagramas y directivas de ingeniería, listo para guardar o descargar.\n"
            )
            ans = await self.ollama.generate(prompt=prompt_with_history, system=system_prompt)
            return {
                "answer": ans,
                "sources": [
                    DocumentSourceRef(
                        document_path=book_id,
                        location="Documento Completo",
                        excerpt=clean_markdown[:180],
                    ).to_dict()
                ],
            }

        # 2. Scoped RAG mediante ChromaDB si supera el tamaño límite
        hits = await self.vector_store.search_scoped(
            library_id=library_id,
            book_id=book_id,
            query=user_query,
            limit=5,
        )

        if not hits and not history and not any(k in user_query.lower() for k in ["genera", "redacta", "crea", "diseña", "flujo", ".md"]):
            return {
                "answer": "El documento no contiene esa información.",
                "sources": [],
            }

        return await self._answer_from_scoped_hits(library_id, book_id, prompt_with_history, hits)

    async def _answer_from_scoped_hits(
        self,
        library_id: str,
        book_id: str,
        prompt: str,
        hits: list[dict[str, Any]],
    ) -> dict[str, Any]:
        """Format chunks from scoped hits and query Ollama."""
        context_parts: list[str] = []
        sources: list[dict[str, Any]] = []

        for h in hits:
            meta = h.get("metadata", {})
            loc = str(meta.get("location", "Cuerpo"))
            src_name = str(meta.get("attachment_name") or meta.get("file_path") or book_id)
            snippet = str(h.get("text", ""))

            context_parts.append(f"--- FUENTE: {src_name} ({loc}) ---\n{snippet}\n")
            sources.append(
                DocumentSourceRef(
                    document_path=book_id,
                    location=loc,
                    excerpt=snippet[:150],
                    is_attachment=bool(meta.get("attachment_name")),
                    attachment_name=meta.get("attachment_name"),
                ).to_dict()
            )

        system_prompt = (
            f"Eres el Copiloto Técnico de Documentación e Ingeniería de ContextForge para el documento '{book_id}'.\n"
            "Responde basándote en los siguientes fragmentos del documento y sus anexos, o asiste al usuario a redactar, generar diagramas o exportar un .md técnico:\n\n"
            + "\n".join(context_parts)
            + "\n\nDIRECTIVAS:\n"
            + "1. Si el usuario te pide un archivo .md estructurado con el flujo o la información analizada, genéralo completo con Frontmatter YAML y diagramas Mermaid.\n"
            + "2. Si la consulta busca hechos puntuales y no se deduce del contexto, indica qué partes no se encontraron en la documentación."
        )

        ans = await self.ollama.generate(prompt=prompt, system=system_prompt)
        return {"answer": ans, "sources": sources}

