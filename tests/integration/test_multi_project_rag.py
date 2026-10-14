"""Integration tests verifying multi-project RAG isolation and zero cross-project leakage."""

from pathlib import Path
import pytest
from core.domain.project import Project, ProjectSlug
from core.use_cases.ingest_docs import IngestDocsUseCase
from application.knowledge_docs.commands import IngestDocsCommand
from application.knowledge_docs.handlers import IngestDocsCommandHandler
from application.rag_engine.queries import SearchHybridQuery
from application.rag_engine.services.hybrid_searcher import HybridSearchService
from infrastructure.repositories.bm25_lexical_repo import BM25LexicalRepository
from infrastructure.repositories.chroma_vector_repo import ChromaVectorRepository
from infrastructure.repositories.local_filesystem_repo import LocalFileSystemRepository


@pytest.mark.asyncio
async def test_multi_project_rag_isolation_and_zero_leakage(tmp_path: Path) -> None:
    """Verify that Project A and Project B have strictly isolated vector and lexical indexes."""
    docs_dir = tmp_path / "docs"
    chroma_dir = tmp_path / "chroma"

    # 1. Setup Project A: iuristrack
    proj_a_dir = docs_dir / "iuristrack" / "billing"
    proj_a_dir.mkdir(parents=True, exist_ok=True)

    project_a = Project.create(
        name="IurisTrack Legal Tech",
        slug="iuristrack",
        description="Sistema de gestión jurídica y facturación recurrente",
    )
    # Save project.json
    import json
    with open(docs_dir / "iuristrack" / "project.json", "w", encoding="utf-8") as f:
        json.dump(project_a.to_dict(), f)

    with open(proj_a_dir / "retry_policy.md", "w", encoding="utf-8") as f:
        f.write(
            """---
title: "Política de Reintentos de Facturación"
module: "billing"
project_slug: "iuristrack"
tags: [stripe, billing, retry]
---

# Reintentos de Pago en Stripe

El sistema IurisTrack implementa una estrategia de reintentos con retroceso exponencial.
Si un webhook de cobro de suscripción de Stripe falla con error de red,
se reprograma con un factor de espera de 2^n segundos hasta un máximo de 5 intentos.
Tras superar los 5 reintentos, la factura pasa al estado fallido y se notifica al suscriptor.
"""
        )

    # 2. Setup Project B: mesa-servicio-upc
    proj_b_dir = docs_dir / "mesa-servicio-upc" / "tickets"
    proj_b_dir.mkdir(parents=True, exist_ok=True)

    project_b = Project.create(
        name="Mesa de Servicio UPC",
        slug="mesa-servicio-upc",
        description="Gestión de incidencias y soporte estudiantil universitario",
    )
    with open(docs_dir / "mesa-servicio-upc" / "project.json", "w", encoding="utf-8") as f:
        json.dump(project_b.to_dict(), f)

    with open(proj_b_dir / "sla_escalation.md", "w", encoding="utf-8") as f:
        f.write(
            """---
title: "Matriz de Escalación de Tickets SLA"
module: "tickets"
project_slug: "mesa-servicio-upc"
tags: [soporte, sla, tickets]
---

# Procedimiento de Escalación de Incidencias

En la Mesa de Servicio de la Universidad UPC, los tickets de soporte del portal estudiantil
se clasifican en niveles de severidad Alta, Media y Baja.
Los incidentes de severidad Alta tienen un SLA de resolución máximo de 2 horas.
Si un ticket de matrícula o notas no recibe respuesta en 60 minutos,
se escala automáticamente al supervisor de turno de soporte TI.
"""
        )

    # 3. Instantiate repositories and services
    doc_repo = LocalFileSystemRepository(base_path=str(docs_dir))
    vector_repo = ChromaVectorRepository(persist_directory=str(chroma_dir))
    lexical_repo = BM25LexicalRepository()
    searcher = HybridSearchService(vector_repo=vector_repo, lexical_repo=lexical_repo)

    # Test project detection from filesystem repo
    detected_slugs = doc_repo.list_project_slugs()
    assert "iuristrack" in detected_slugs
    assert "mesa-servicio-upc" in detected_slugs

    # Test reading project metadata
    meta_a = doc_repo.get_project_metadata("iuristrack")
    assert meta_a is not None
    assert meta_a["name"] == "IurisTrack Legal Tech"

    # 4. Ingest docs using IngestDocsCommandHandler
    handler = IngestDocsCommandHandler(doc_repo, vector_repo, lexical_repo)
    total_indexed = await handler.handle(IngestDocsCommand(target_directory=str(docs_dir)))
    assert total_indexed >= 2

    # Verify that collections were created with correct naming cf_project_{slug}
    collections = vector_repo.list_collections()
    assert "cf_project_iuristrack" in collections
    assert "cf_project_mesa-servicio-upc" in collections

    # 5. Query Project A: must return iuristrack results and ZERO mesa-servicio-upc results
    results_a = await searcher.search(
        query="reintentos de pago webhook stripe",
        top_k=5,
        project_slug="iuristrack",
    )
    assert len(results_a) > 0
    for r in results_a:
        assert "iuristrack" in r.file_path
        assert "mesa-servicio-upc" not in r.file_path
        assert "upc" not in r.text.lower()
        assert "estudiantil" not in r.text.lower()

    # 6. Query Project B: must return mesa-servicio-upc results and ZERO iuristrack results
    results_b = await searcher.search(
        query="escalación de tickets severidad alta portal estudiantil",
        top_k=5,
        project_slug="mesa-servicio-upc",
    )
    assert len(results_b) > 0
    for r in results_b:
        assert "mesa-servicio-upc" in r.file_path
        assert "iuristrack" not in r.file_path
        assert "stripe" not in r.text.lower()
        assert "facturación" not in r.text.lower()

    # 7. Negative Search (Zero Leakage verification):
    # Lexical search for terms unique to Project B yields 0 results in Project A
    lexical_cross_a = await lexical_repo.search(
        query="matrícula estudiantil universidad upc severidad",
        top_k=5,
        project_slug="iuristrack",
    )
    assert len(lexical_cross_a) == 0, f"Expected 0 lexical results for Project A cross-query, got: {lexical_cross_a}"

    # Lexical search for terms unique to Project A yields 0 results in Project B
    lexical_cross_b = await lexical_repo.search(
        query="stripe webhook retroceso exponencial cobro",
        top_k=5,
        project_slug="mesa-servicio-upc",
    )
    assert len(lexical_cross_b) == 0, f"Expected 0 lexical results for Project B cross-query, got: {lexical_cross_b}"

    # Hybrid search in Project A MUST NEVER contain any chunk from Project B
    cross_hybrid_a = await searcher.search(
        query="matrícula estudiantil universidad upc severidad",
        top_k=5,
        project_slug="iuristrack",
    )
    for r in cross_hybrid_a:
        assert "mesa-servicio-upc" not in r.file_path
        assert "iuristrack" in r.file_path

    # Hybrid search in Project B MUST NEVER contain any chunk from Project A
    cross_hybrid_b = await searcher.search(
        query="stripe webhook retroceso exponencial cobro",
        top_k=5,
        project_slug="mesa-servicio-upc",
    )
    for r in cross_hybrid_b:
        assert "iuristrack" not in r.file_path
        assert "mesa-servicio-upc" in r.file_path

    # 8. Test IngestDocsUseCase on a single isolated project
    use_case = IngestDocsUseCase(doc_repo, vector_repo, lexical_repo)
    reindexed_a = await use_case.execute(project_slug="iuristrack")
    assert reindexed_a > 0

    # Project B remains unaffected
    results_b_after = await searcher.search(
        query="escalación de tickets",
        top_k=5,
        project_slug="mesa-servicio-upc",
    )
    assert len(results_b_after) > 0

    # 9. Test project deletion in vector repo
    await vector_repo.delete_project("iuristrack")
    collections_after = vector_repo.list_collections()
    assert "cf_project_iuristrack" not in collections_after
    assert "cf_project_mesa-servicio-upc" in collections_after
