"""Use Case: AI-Assisted Documentation Scaffolding and Blueprint Expansion."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
import logging
import re
import unicodedata
from core.templates.blueprints import DocumentBlueprint, get_blueprint_by_id
from domain.knowledge_docs.entities import Document
from domain.knowledge_docs.repositories import IDocumentRepository
from domain.rag_engine.repositories import ILexicalIndexRepository, IOllamaClient, IVectorRepository
from domain.settings.repositories import ISettingsRepository

logger = logging.getLogger("core.scaffold")


@dataclass(frozen=True)
class ScaffoldDocCommand:
    """Command payload for scaffolding technical documentation with local AI or template blueprints."""

    project_slug: str
    template_id: str
    title: str
    context_description: str
    module: str | None = None
    author: str = "Equipo Técnico"
    use_ai: bool = True


class ScaffoldDocUseCase:
    """Orchestrates AI-driven documentation generation, blueprint expansion, and isolated persistence."""

    def __init__(
        self,
        doc_repo: IDocumentRepository,
        vector_repo: IVectorRepository,
        lexical_repo: ILexicalIndexRepository,
        ollama_client: IOllamaClient,
        settings_repo: ISettingsRepository,
    ) -> None:
        self._doc_repo = doc_repo
        self._vector_repo = vector_repo
        self._lexical_repo = lexical_repo
        self._ollama_client = ollama_client
        self._settings_repo = settings_repo

    async def execute(self, command: ScaffoldDocCommand) -> Document:
        """Execute scaffolding, persisting and indexing the newly created technical specification."""
        blueprint = get_blueprint_by_id(command.template_id)
        if not blueprint:
            raise ValueError(f"Plantilla no soportada: '{command.template_id}'.")

        clean_slug = command.project_slug.strip().lower() or "default"
        target_module = (command.module or blueprint.default_module).strip().lower()
        normalized_title = unicodedata.normalize("NFKD", command.title).encode("ascii", "ignore").decode("utf-8")
        file_stem = re.sub(r"[^a-zA-Z0-9_-]+", "_", normalized_title.lower()).strip("_")
        relative_path = f"modules/{target_module}/{file_stem}.md"

        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        tags_str = ", ".join(blueprint.default_tags)

        # Generate markdown content
        if command.use_ai:
            content_markdown = await self._generate_with_ai(
                command=command,
                blueprint=blueprint,
                target_module=target_module,
                today_str=today_str,
                tags_str=tags_str,
            )
        else:
            content_markdown = self._format_blueprint(
                blueprint=blueprint,
                command=command,
                target_module=target_module,
                today_str=today_str,
                tags_str=tags_str,
            )

        # Persist to local Docs-as-Code filesystem
        doc = await self._doc_repo.save_document(
            relative_path=relative_path,
            content=content_markdown,
            project_slug=clean_slug,
        )

        # Index into isolated vector and lexical stores
        if doc.chunks:
            await self._vector_repo.upsert_chunks(doc.chunks, project_slug=clean_slug)
            await self._lexical_repo.index_chunks(doc.chunks, project_slug=clean_slug)

        return doc

    async def _generate_with_ai(
        self,
        command: ScaffoldDocCommand,
        blueprint: DocumentBlueprint,
        target_module: str,
        today_str: str,
        tags_str: str,
    ) -> str:
        """Invoke local Ollama LLM to synthesize thorough technical documentation."""
        settings = await self._settings_repo.get_settings()
        model = settings.active_llm_model

        system_prompt = (
            "Eres un Principal Software Architect y Technical Writer de ContextForge. "
            "Generas documentación técnica exhaustiva en Markdown con Frontmatter YAML y diagramas Mermaid.js precisos."
        )

        user_prompt = f"""Genera un documento técnico exhaustivo y profesional basado en la plantilla '{blueprint.name}'.

DATOS DEL PROYECTO:
- Título: {command.title}
- Módulo: {target_module}
- Proyecto: {command.project_slug}
- Autor: {command.author}
- Contexto y Requerimientos:
{command.context_description}

ESTRUCTURA DE REFERENCIA:
{blueprint.markdown_template}

REGLAS OBLIGATORIAS:
1. Comienza directamente con el Frontmatter YAML delimitado por --- con title, module, project_slug, author, tags y date.
2. Desarrolla exhaustivamente cada sección con detalles técnicos reales derivados del contexto provisto.
3. Incluye obligatoriamente un diagrama Mermaid.js sintácticamente correcto dentro de un bloque ```mermaid.
4. Devuelve ÚNICAMENTE el documento Markdown completo, sin texto conversacional introductorio ni conclusiones fuera del archivo.
"""

        try:
            generated = await self._ollama_client.generate_completion(
                model=model,
                prompt=user_prompt,
                system_prompt=system_prompt,
            )

            # Check if LLM returned an error or was unavailable
            if not generated or "[Error" in generated or "[Ollama Desconectado]" in generated:
                logger.warning("Ollama generation returned error, falling back to blueprint: %s", generated)
                return self._format_blueprint(blueprint, command, target_module, today_str, tags_str)

            cleaned = self._clean_llm_output(generated, command, target_module, today_str, tags_str)
            return cleaned

        except Exception as e:
            logger.warning("Exception during AI scaffolding, using template fallback: %s", e)
            return self._format_blueprint(blueprint, command, target_module, today_str, tags_str)

    def _clean_llm_output(
        self,
        raw_output: str,
        command: ScaffoldDocCommand,
        target_module: str,
        today_str: str,
        tags_str: str,
    ) -> str:
        """Strip surrounding code fence markdown tags if the model wrapped the entire document."""
        text = raw_output.strip()
        if text.startswith("```markdown"):
            text = text[len("```markdown") :].strip()
            if text.endswith("```"):
                text = text[:-3].strip()
        elif text.startswith("```md"):
            text = text[len("```md") :].strip()
            if text.endswith("```"):
                text = text[:-3].strip()

        # If frontmatter was omitted by the model, prepend standard frontmatter
        if not text.startswith("---"):
            header = f"""---
title: "{command.title}"
module: "{target_module}"
project_slug: "{command.project_slug}"
author: "{command.author}"
tags: [{tags_str}]
date: "{today_str}"
---

"""
            text = header + text

        return text

    def _format_blueprint(
        self,
        blueprint: DocumentBlueprint,
        command: ScaffoldDocCommand,
        target_module: str,
        today_str: str,
        tags_str: str,
    ) -> str:
        """Populate the standard template blueprint safely without colliding with JSON braces."""
        text = blueprint.markdown_template
        text = text.replace("{title}", command.title)
        text = text.replace("{module}", target_module)
        text = text.replace("{project_slug}", command.project_slug)
        text = text.replace("{author}", command.author)
        text = text.replace("{tags}", tags_str)
        text = text.replace("{date}", today_str)
        return text
