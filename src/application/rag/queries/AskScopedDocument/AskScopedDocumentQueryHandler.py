"""AskScopedDocument Query Handler supporting both Q&A and rich Markdown document-authoring assistance."""

from __future__ import annotations

import re
import time
from typing import Any

from application.rag.queries.AskScopedDocument.AskScopedDocumentQuery import AskScopedDocumentQuery
from domain.common import ErrorOr
from domain.rag import ILLMProviderPort

_FRONTMATTER_RE = re.compile(r"^\s*---\s*\n.*?\n---\s*\n?", re.DOTALL)


class AskScopedDocumentQueryHandler:
    def __init__(self, primary_llm: ILLMProviderPort, fallback_llm: ILLMProviderPort) -> None:
        self._primary_llm = primary_llm
        self._fallback_llm = fallback_llm

    async def handle(self, request: AskScopedDocumentQuery) -> ErrorOr[dict[str, Any]]:
        t0 = time.perf_counter()
        raw_content = (request.content_markdown or "").strip()
        body_content = _FRONTMATTER_RE.sub("", raw_content).strip()
        doc_title = (request.document_title or "Sin título").strip()
        question = request.question.strip()

        if body_content:
            sys_prompt = (
                "Eres un arquitecto de software y redactor técnico experto en documentación Markdown (GFM, tablas y diagramas Mermaid). "
                "Tienes el documento actual del editor como contexto principal. "
                "Si el usuario pide redactar, ampliar o crear secciones, guías, ejemplos o diagramas Mermaid, entrega un documento "
                "Markdown completo, profundo, bien estructurado en español y listo para insertar en el editor (sin repetir frontmatter YAML). "
                "Si el usuario hace una pregunta sobre el documento, respóndela con precisión basándote en su contenido."
            )
            prompt = (
                f"<context_chunk index='1' source='{request.document_path or 'borrador.md'}' title='{doc_title}' section='Documento Activo'>\n"
                f"{body_content[:12000]}\n</context_chunk>\n\nSolicitud del usuario: {question}"
            )
        else:
            sys_prompt = (
                "Eres un arquitecto de software y redactor técnico experto en documentación Markdown (GFM, tablas y diagramas Mermaid). "
                "Ayuda al usuario redactando contenido técnico completo, claro, bien estructurado en español y listo para insertar en el editor."
            )
            prompt = (
                f"Documento nuevo titulado: '{doc_title}'.\n"
                f"Solicitud del usuario: {question}"
            )

        degraded = False
        fallback_reason = ""
        try:
            answer = await self._primary_llm.generate(prompt, system_prompt=sys_prompt)
            provider = self._primary_llm.provider_name
            if not answer.strip():
                raise RuntimeError("El motor IA devolvió una respuesta vacía.")
        except Exception as exc:
            degraded = True
            fallback_reason = str(exc).strip() or type(exc).__name__
            provider = self._fallback_llm.provider_name
            if body_content and len(body_content) > 220:
                answer = await self._fallback_llm.generate(prompt, system_prompt=sys_prompt)
            else:
                answer = (
                    f"# {doc_title}\n\n"
                    f"> **Nota:** No se pudo completar la generación con el motor IA principal (`{fallback_reason}`). "
                    "Puedes reintentar o seleccionar un motor/modelo más rápido en **Configuración (`/settings`)**.\n\n"
                    f"## Objetivo\nBorrador inicial para: **{question}**.\n\n"
                    "## Puntos clave\n- Define el contexto, alcance y arquitectura.\n- Documenta las reglas de negocio, ejemplos y diagramas Mermaid.\n"
                )
        return ErrorOr.ok(
            {
                "answer": answer,
                "document_path": request.document_path,
                "document_title": doc_title,
                "provider": provider,
                "degraded_fallback": degraded,
                "fallback_reason": fallback_reason,
                "latency_ms": round((time.perf_counter() - t0) * 1000.0, 2),
            }
        )
