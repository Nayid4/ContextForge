"""Prompt Builder for ContextForge Grounded Inference."""

from __future__ import annotations

from domain.rag_engine.entities import Citation, PromptContext, RetrievalResult

SYSTEM_PROMPT = """Eres el Arquitecto Técnico Soberano de ContextForge.
Tu misión es resolver dudas técnicas y funcionales basándote EXCLUSIVAMENTE en la documentación provista en el CONTEXTO.

REGLAS OBLIGATORIAS:
1. CITAS OBLIGATORIAS: Cita siempre las fuentes de las cuales extraes cada respuesta usando el formato de píldora de archivo, por ejemplo [billing_retry_policy.md] o [001_event_driven_payments.md].
2. DECLARACIÓN DE DESCONOCIMIENTO: Si el contexto provisto no contiene la información para responder la pregunta, declara explícitamente: "No se encontró información en la documentación local para responder a esta consulta." NO inventes reglas de negocio ni alucines comportamientos.
3. PRECISIÓN TÉCNICA: Responde con claridad, estructurando la respuesta con encabezados y bloques de código cuando corresponda.
"""


class PromptBuilder:
    """Assembles prompt and citations from retrieved chunks."""

    def build_prompt(self, query: str, chunks: list[RetrievalResult]) -> PromptContext:
        citations: list[Citation] = []
        context_blocks: list[str] = []
        seen_files: set[str] = set()

        for c in chunks:
            file_name = c.file_path.split("/")[-1]
            header = " > ".join(c.header_hierarchy) if c.header_hierarchy else file_name
            snippet = c.text[:120].strip() + "..."
            if c.file_path not in seen_files:
                seen_files.add(c.file_path)
                citations.append(Citation(file_path=c.file_path, header=header, snippet=snippet))

            block = f"--- FUENTE: {c.file_path} (Sección: {header}) ---\n{c.text}\n"
            context_blocks.append(block)

        context_str = "\n".join(context_blocks)
        user_content = f"CONTEXTO RECUPERADO DE LA DOCUMENTACIÓN LOCAL:\n{context_str}\n\nPREGUNTA DEL DESARROLLADOR:\n{query}"

        return PromptContext(
            query=query,
            prompt_text=user_content,
            citations=citations,
            total_tokens=len(user_content.split()),
        )

