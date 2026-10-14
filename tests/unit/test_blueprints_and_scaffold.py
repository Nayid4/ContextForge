"""Unit tests for technical documentation blueprints and ScaffoldDocUseCase."""

from pathlib import Path
from unittest.mock import AsyncMock
import pytest
from core.templates.blueprints import get_all_blueprints, get_blueprint_by_id
from core.use_cases.scaffold_doc import ScaffoldDocCommand, ScaffoldDocUseCase
from domain.knowledge_docs.entities import Document, DocumentChunk
from domain.settings.entities import SystemSettings
from infrastructure.repositories.bm25_lexical_repo import BM25LexicalRepository
from infrastructure.repositories.chroma_vector_repo import ChromaVectorRepository
from infrastructure.repositories.local_filesystem_repo import LocalFileSystemRepository


def test_blueprints_catalog_integrity() -> None:
    """Verify that all four standardized blueprints are registered with complete schemas."""
    blueprints = get_all_blueprints()
    assert len(blueprints) == 4

    blueprint_ids = {b.id for b in blueprints}
    assert blueprint_ids == {"adr", "business_flow", "api_integration", "troubleshooting"}

    for b in blueprints:
        assert b.name
        assert b.category
        assert b.description
        assert b.default_module
        assert len(b.default_tags) > 0
        assert "```mermaid" in b.markdown_template
        assert "{title}" in b.markdown_template
        assert "{project_slug}" in b.markdown_template


def test_get_blueprint_by_id_lookup() -> None:
    """Verify blueprint lookup by identifier is case-insensitive and handles unknown IDs."""
    adr = get_blueprint_by_id("ADR")
    assert adr is not None
    assert adr.id == "adr"

    bf = get_blueprint_by_id("business_flow")
    assert bf is not None
    assert bf.default_module == "business_flows"

    unknown = get_blueprint_by_id("non_existent_blueprint")
    assert unknown is None


@pytest.mark.asyncio
async def test_scaffold_doc_use_case_without_ai(tmp_path: Path) -> None:
    """Verify static scaffolding populates blueprint template with project isolation."""
    docs_dir = tmp_path / "docs"
    chroma_dir = tmp_path / "chroma"

    doc_repo = LocalFileSystemRepository(base_path=str(docs_dir))
    vector_repo = ChromaVectorRepository(persist_directory=str(chroma_dir))
    lexical_repo = BM25LexicalRepository()

    ollama_mock = AsyncMock()
    settings_mock = AsyncMock()
    settings_mock.get_settings.return_value = SystemSettings(active_llm_model="llama3.1:8b")

    use_case = ScaffoldDocUseCase(
        doc_repo=doc_repo,
        vector_repo=vector_repo,
        lexical_repo=lexical_repo,
        ollama_client=ollama_mock,
        settings_repo=settings_mock,
    )

    command = ScaffoldDocCommand(
        project_slug="mesa-servicio-upc",
        template_id="troubleshooting",
        title="Fallo de Conexión en Portal de Alumnos",
        context_description="Los estudiantes experimentan timeout 504 durante la matrícula universitaria.",
        module="portal",
        author="Soporte Nivel 2",
        use_ai=False,
    )

    doc = await use_case.execute(command)

    # 1. Verification of generated entity
    assert doc.project_slug == "mesa-servicio-upc"
    assert doc.title == "Fallo de Conexión en Portal de Alumnos"
    assert doc.module == "portal"
    assert doc.author == "Soporte Nivel 2"
    assert "Fallo de Conexión en Portal de Alumnos" in doc.content_markdown
    assert "```mermaid" in doc.content_markdown

    # 2. Filesystem verification
    saved_file = docs_dir / "mesa-servicio-upc" / "modules" / "portal" / "fallo_de_conexion_en_portal_de_alumnos.md"
    assert saved_file.exists()

    # 3. Vector and lexical indexing verification
    count = await vector_repo.count("mesa-servicio-upc")
    assert count > 0

    lexical_results = await lexical_repo.search("portal alumnos conexion", project_slug="mesa-servicio-upc")
    assert len(lexical_results) > 0


@pytest.mark.asyncio
async def test_scaffold_doc_use_case_with_ai_mock(tmp_path: Path) -> None:
    """Verify AI scaffolding delegates prompt to LLM and parses generated markdown."""
    docs_dir = tmp_path / "docs"
    chroma_dir = tmp_path / "chroma"

    doc_repo = LocalFileSystemRepository(base_path=str(docs_dir))
    vector_repo = ChromaVectorRepository(persist_directory=str(chroma_dir))
    lexical_repo = BM25LexicalRepository()

    generated_ai_md = """---
title: "ADR-004: Migración a Cache Redis Distribuida"
module: "architecture"
project_slug: "iuristrack"
author: "Arquitecto Cloud"
tags: [redis, cache, performance]
date: "2026-10-13"
---

# ADR-004: Migración a Cache Redis Distribuida

## 1. Contexto y Problema
El volumen de consultas concurrentes a expedientes judiciales satura la base de datos principal.

## 2. Decisión Arquitectónica
Implementar cache de segundo nivel con Redis y TTL de 15 minutos.

## 3. Diagrama de Arquitectura
```mermaid
flowchart LR
    API["IurisTrack API"] --> Redis[("Redis Cluster")]
    API --> SQL[("PostgreSQL")]
```
"""

    ollama_mock = AsyncMock()
    ollama_mock.generate_completion.return_value = generated_ai_md

    settings_mock = AsyncMock()
    settings_mock.get_settings.return_value = SystemSettings(active_llm_model="llama3.1:8b")

    use_case = ScaffoldDocUseCase(
        doc_repo=doc_repo,
        vector_repo=vector_repo,
        lexical_repo=lexical_repo,
        ollama_client=ollama_mock,
        settings_repo=settings_mock,
    )

    command = ScaffoldDocCommand(
        project_slug="iuristrack",
        template_id="adr",
        title="Migración a Cache Redis Distribuida",
        context_description="Optimizar la latencia p99 de consulta de expedientes judiciales.",
        author="Arquitecto Cloud",
        use_ai=True,
    )

    doc = await use_case.execute(command)

    assert doc.project_slug == "iuristrack"
    assert "ADR-004" in doc.title or "Migración a Cache Redis Distribuida" in doc.title
    assert "Redis Cluster" in doc.content_markdown
    assert "```mermaid" in doc.content_markdown
    ollama_mock.generate_completion.assert_awaited_once()


@pytest.mark.asyncio
async def test_scaffold_doc_fallback_on_ollama_failure(tmp_path: Path) -> None:
    """Verify that if Ollama service is disconnected, use case gracefully falls back to blueprint."""
    docs_dir = tmp_path / "docs"
    chroma_dir = tmp_path / "chroma"

    doc_repo = LocalFileSystemRepository(base_path=str(docs_dir))
    vector_repo = ChromaVectorRepository(persist_directory=str(chroma_dir))
    lexical_repo = BM25LexicalRepository()

    ollama_mock = AsyncMock()
    ollama_mock.generate_completion.return_value = "[Ollama Desconectado]: No se pudo conectar al servicio local."

    settings_mock = AsyncMock()
    settings_mock.get_settings.return_value = SystemSettings(active_llm_model="llama3.1:8b")

    use_case = ScaffoldDocUseCase(
        doc_repo=doc_repo,
        vector_repo=vector_repo,
        lexical_repo=lexical_repo,
        ollama_client=ollama_mock,
        settings_repo=settings_mock,
    )

    command = ScaffoldDocCommand(
        project_slug="iuristrack",
        template_id="api_integration",
        title="Integración Pasarela de Pagos Stripe",
        context_description="Cobro recurrente de suscripciones con webhooks.",
        use_ai=True,
    )

    doc = await use_case.execute(command)

    # Document was still generated and saved via template fallback
    assert doc.project_slug == "iuristrack"
    assert doc.title == "Integración Pasarela de Pagos Stripe"
    assert "Especificación de Integración" in doc.content_markdown
    assert "```mermaid" in doc.content_markdown
