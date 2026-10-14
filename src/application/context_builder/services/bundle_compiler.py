"""Context Bundle Compiler for AI IDE assistants (Cursor, Copilot, Windsurf)."""

from __future__ import annotations

from datetime import datetime, timezone
import uuid
from domain.context_builder.entities import BundleSpecification, ContextBundle
from domain.knowledge_docs.entities import Document


class BundleCompiler:
    """Compiles multiple Markdown documents into a structured context bundle."""

    def compile(self, spec: BundleSpecification, documents: list[Document]) -> ContextBundle:
        bundle_id = str(uuid.uuid4())[:8]
        modules_label = "_".join(spec.modules) if spec.modules else "all_modules"
        title = f"Context Bundle: {modules_label} ({bundle_id})"
        is_cursorrules = spec.export_format.lower() == "cursorrules"
        ext = "cursorrules" if is_cursorrules else "md"

        if is_cursorrules:
            title = f".cursorrules: {modules_label} ({bundle_id})"
            parts: list[str] = [
                "# CURSOR & WINDSURF AI RULES - ContextForge Knowledge Bundle",
                f"# Project: {spec.project_slug} | Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}",
                "",
                "## STRICT INSTRUCTIONS FOR THE AI ASSISTANT",
                "You are working on a sovereign codebase governed by the engineering rules documented below.",
                "- You MUST strictly respect all architectural patterns, schemas, and invariants described in these specifications.",
                "- Never hallucinate configuration values or business rules.",
                "- When suggesting code changes, ensure alignment with the referenced ADRs and module boundaries.",
                "",
            ]
            if spec.include_toc:
                parts.append("## INDEXED SPECIFICATIONS & FILES")
                for doc in documents:
                    parts.append(f"- {doc.title} (Module: {doc.module}, File: {doc.path})")
                parts.append("")

            for doc in documents:
                parts.extend([
                    "---",
                    f"### SPECIFICATION: {doc.title} (Path: {doc.path})",
                    doc.content_markdown,
                    "",
                ])
        else:
            parts = [
                f"# {title}",
                f"> Generado por ContextForge el {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}",
                f"> Módulos incluidos: {', '.join(spec.modules) if spec.modules else 'Todos'}",
                "",
            ]

            if spec.include_guidelines:
                parts.extend([
                    "## Directrices Operativas para el Asistente de IA (Cursor / Windsurf / Copilot)",
                    "1. Eres un asistente de desarrollo asistido consciente de las reglas de negocio de este repositorio.",
                    "2. NO inventes ni alteres reglas de negocio o contratos documentados en este paquete de contexto.",
                    "3. Respeta estrictamente los Architecture Decision Records (ADRs) aquí contenidos.",
                    "",
                ])

            if spec.include_toc:
                parts.append("## Tabla de Contenidos")
                for doc in documents:
                    doc_name = doc.path.split("/")[-1]
                    parts.append(f"- [{doc.title} ({doc_name})](#{doc.path.replace('/', '-').replace('.', '-')})")
                parts.append("")

            for doc in documents:
                doc_anchor = doc.path.replace("/", "-").replace(".", "-")
                parts.extend([
                    "---",
                    f"## Documento: {doc.title} <a id='{doc_anchor}'></a>",
                    f"**Ruta:** `{doc.path}` | **Módulo:** `{doc.module}` | **Autor:** {doc.author}",
                    "",
                    doc.content_markdown,
                    "",
                ])

        compiled = "\n".join(parts)
        token_count = len(compiled.split())  # approximate

        return ContextBundle(
            id=bundle_id,
            title=title,
            modules=spec.modules,
            compiled_markdown=compiled,
            token_count=token_count,
            file_path=f"./bundles/context_bundle_{modules_label}_{bundle_id}.{ext}",
        )


