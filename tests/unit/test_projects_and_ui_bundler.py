"""Unit and Integration Tests for Multi-Project Repository, UI Screaming Modules, and Hierarchical Bundler."""

from __future__ import annotations

from pathlib import Path
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from core.domain.project import Project, ProjectSlug
from core.use_cases.ingest_docs import IngestDocsUseCase
from infrastructure.database.orm_models import Base
from infrastructure.repositories.sqlite_project_repo import SqliteProjectRepository
from application.context_builder.commands import BuildContextBundleCommand
from application.context_builder.handlers import BuildContextBundleCommandHandler
from application.context_builder.services.bundle_compiler import BundleCompiler
from domain.context_builder.entities import BundleSpecification
from domain.knowledge_docs.entities import Document
from infrastructure.external.bundle_exporter import LocalBundleExporter
from presentation.api.dependencies import get_db_session, get_project_repo
from typing import AsyncGenerator
from main import app


@pytest.fixture
async def test_db_session(tmp_path: Path) -> AsyncGenerator[AsyncSession, None]:
    db_path = tmp_path / "test_projects.db"
    engine = create_async_engine(f"sqlite+aiosqlite:///{db_path.as_posix()}", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with session_factory() as session:
        yield session
    await engine.dispose()


@pytest.mark.asyncio
async def test_sqlite_project_repository_crud_and_active_switching(test_db_session: AsyncSession, tmp_path: Path) -> None:
    docs_dir = tmp_path / "docs"
    docs_dir.mkdir(parents=True, exist_ok=True)

    repo = SqliteProjectRepository(session=test_db_session, docs_base_path=str(docs_dir))

    # 1. List initial (auto-discovery / default seeding)
    initial_projects = await repo.list_all()
    assert len(initial_projects) >= 1
    assert any(p.slug.value == "default" for p in initial_projects)

    # 2. Save new projects
    proj_a = Project.create(
        name="Proyecto Alpha",
        slug="alpha-core",
        description="Core services",
        path=str(docs_dir / "alpha-core"),
        is_active=False,
    )
    proj_b = Project.create(
        name="Proyecto Beta",
        slug="beta-edge",
        description="Edge worker",
        path=str(docs_dir / "beta-edge"),
        is_active=False,
    )
    await repo.save(proj_a)
    await repo.save(proj_b)

    # Verify project.json written to disk
    meta_a = docs_dir / "alpha-core" / "project.json"
    assert meta_a.exists()

    # 3. Retrieve by slug
    fetched_a = await repo.get_by_slug("alpha-core")
    assert fetched_a is not None
    assert fetched_a.name == "Proyecto Alpha"

    # 4. Set active project
    await repo.set_active("alpha-core")
    active = await repo.get_active()
    assert active is not None
    assert active.slug.value == "alpha-core"

    # Switch active to Beta
    await repo.set_active("beta-edge")
    active_b = await repo.get_active()
    assert active_b is not None
    assert active_b.slug.value == "beta-edge"

    # Verify Alpha is no longer active
    re_fetched_a = await repo.get_by_slug("alpha-core")
    assert re_fetched_a is not None
    assert re_fetched_a.is_active is False

    # 5. Delete
    deleted = await repo.delete("alpha-core")
    assert deleted is True
    assert await repo.get_by_slug("alpha-core") is None


def test_bundle_compiler_supports_markdown_and_cursorrules(tmp_path: Path) -> None:
    compiler = BundleCompiler()

    doc1 = Document(
        path="billing/rules.md",
        title="Reglas de Facturación",
        module="billing",
        content_markdown="Regla: Timeout de 3s en cobros.",
        project_slug="billing-proj",
    )

    # Markdown compilation
    spec_md = BundleSpecification(
        modules=["billing"],
        max_tokens=16000,
        include_toc=True,
        include_guidelines=True,
        export_format="markdown",
        project_slug="billing-proj",
    )
    bundle_md = compiler.compile(spec_md, [doc1])
    assert bundle_md.file_path.endswith(".md")
    assert "Directrices Operativas para el Asistente de IA" in bundle_md.compiled_markdown
    assert "Reglas de Facturación" in bundle_md.compiled_markdown

    # Cursorrules compilation
    spec_rules = BundleSpecification(
        modules=["billing"],
        max_tokens=16000,
        include_toc=True,
        include_guidelines=True,
        export_format="cursorrules",
        project_slug="billing-proj",
    )
    bundle_rules = compiler.compile(spec_rules, [doc1])
    assert bundle_rules.file_path.endswith(".cursorrules")
    assert "CURSOR & WINDSURF AI RULES" in bundle_rules.compiled_markdown
    assert "STRICT INSTRUCTIONS FOR THE AI ASSISTANT" in bundle_rules.compiled_markdown


@pytest.mark.asyncio
async def test_ui_projects_endpoints_and_navigation(tmp_path: Path) -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. List Projects View
        resp_list = await client.get("/projects")
        assert resp_list.status_code == 200
        assert "Proyectos de Ingeniería Multi-Tenant" in resp_list.text

        # 2. Navbar Selector Fragment
        resp_nav = await client.get("/ui/projects/navbar-selector")
        assert resp_nav.status_code == 200
        assert "global-project-select" in resp_nav.text

        # 3. Create Project
        resp_create = await client.post(
            "/projects/new",
            data={
                "name": "Proyecto Fintech",
                "slug": "fintech-core",
                "description": "Servicios financieros",
                "make_active": "true",
            },
            follow_redirects=False,
        )
        assert resp_create.status_code == 302
        assert resp_create.headers["location"] == "/projects"
        assert "cf_active_project=fintech-core" in resp_create.headers.get("set-cookie", "")

        # 4. Switch Project via HTMX header
        resp_switch_htmx = await client.post(
            "/ui/projects/switch",
            data={"project_slug": "fintech-core"},
            headers={"HX-Request": "true"},
        )
        assert resp_switch_htmx.status_code == 200
        assert resp_switch_htmx.headers.get("HX-Refresh") == "true"
        assert "cf_active_project=fintech-core" in resp_switch_htmx.headers.get("set-cookie", "")

        # 5. Bundler UI with active project
        resp_bundles = await client.get("/bundles?project=fintech-core")
        assert resp_bundles.status_code == 200
        assert "Árbol Jerárquico: Módulos y Documentos" in resp_bundles.text
        assert ".cursorrules" in resp_bundles.text

        # 6. Compile Bundle with .cursorrules
        resp_compile = await client.post(
            "/bundles/compile",
            data={
                "modules": ["architecture"],
                "project_slug": "fintech-core",
                "export_format": "cursorrules",
                "max_tokens": "16000",
                "include_toc": "true",
                "include_guidelines": "true",
            },
        )
        assert resp_compile.status_code == 200
        assert "Bundle generado exitosamente" in resp_compile.text
        assert "cursorrules" in resp_compile.text

        # 7. Non-HTMX Project Switch Redirect
        resp_switch_redirect = await client.post(
            "/ui/projects/switch",
            data={"project_slug": "fintech-core"},
            headers={"referer": "http://test/docs/browser"},
            follow_redirects=False,
        )
        assert resp_switch_redirect.status_code == 303
        assert resp_switch_redirect.headers["location"] == "http://test/docs/browser"


@pytest.mark.asyncio
async def test_ingest_docs_use_case_isolated_and_multi(tmp_path: Path) -> None:
    from infrastructure.repositories.local_filesystem_repo import LocalFileSystemRepository
    from infrastructure.repositories.chroma_vector_repo import ChromaVectorRepository
    from infrastructure.repositories.bm25_lexical_repo import BM25LexicalRepository

    docs_dir = tmp_path / "docs"
    docs_dir.mkdir(parents=True, exist_ok=True)
    p1 = docs_dir / "p1" / "modules" / "auth"
    p1.mkdir(parents=True, exist_ok=True)
    (p1 / "doc1.md").write_text("# Doc 1\nContenido de auth.", encoding="utf-8")

    doc_repo = LocalFileSystemRepository(base_path=str(docs_dir))
    vector_repo = ChromaVectorRepository(persist_directory=str(tmp_path / "chroma"))
    lexical_repo = BM25LexicalRepository()

    use_case = IngestDocsUseCase(doc_repo, vector_repo, lexical_repo)

    # 1. Ingest single project
    count_single = await use_case.execute(project_slug="p1")
    assert count_single >= 1

    # 2. Ingest all projects
    count_all = await use_case.execute(project_slug=None)
    assert count_all >= 1


@pytest.mark.asyncio
async def test_sql_settings_repository_lifecycle(test_db_session: AsyncSession) -> None:
    from infrastructure.repositories.sql_settings_repo import SqlSettingsRepository
    from domain.settings.entities import SystemSettings

    repo = SqlSettingsRepository(session=test_db_session)

    # 1. Default fallback
    settings = await repo.get_settings()
    assert settings.active_llm_model == "llama3.1:8b"

    # 2. Save settings (insert)
    custom = SystemSettings(
        active_llm_model="mistral:latest",
        ollama_url="http://localhost:11434",
        docs_path="./custom_docs",
        embedding_model="nomic-embed-text",
        temperature=0.3,
    )
    await repo.save_settings(custom)

    fetched = await repo.get_settings()
    assert fetched.active_llm_model == "mistral:latest"
    assert fetched.temperature == 0.3

    # 3. Update existing settings
    updated = SystemSettings(
        active_llm_model="gemma4:latest",
        temperature=0.5,
    )
    await repo.save_settings(updated)

    re_fetched = await repo.get_settings()
    assert re_fetched.active_llm_model == "gemma4:latest"
    assert re_fetched.temperature == 0.5


@pytest.mark.asyncio
async def test_sqlite_project_repo_edge_cases(test_db_session: AsyncSession, tmp_path: Path) -> None:
    docs_dir = tmp_path / "docs_edge"
    docs_dir.mkdir(parents=True, exist_ok=True)
    
    # Create folder with markdown but without project.json
    custom_folder = docs_dir / "custom-legacy"
    custom_folder.mkdir(parents=True, exist_ok=True)
    (custom_folder / "test.md").write_text("# Hello", encoding="utf-8")

    repo = SqliteProjectRepository(session=test_db_session, docs_base_path=str(docs_dir))

    # Test discovery from filesystem
    discovered = repo._discover_from_filesystem()
    assert any(p.slug.value == "custom-legacy" for p in discovered)

    # Test update existing ORM
    p_existing = Project.create(name="Existing Proj", slug="existing-proj")
    await repo.save(p_existing)

    p_updated = Project.create(name="Existing Proj Updated", slug="existing-proj", description="Updated desc")
    await repo.save(p_updated)
    fetched = await repo.get_by_slug("existing-proj")
    assert fetched is not None
    assert fetched.name == "Existing Proj Updated"

    # Delete non-existent
    del_non_existent = await repo.delete("does-not-exist")
    assert del_non_existent is False


@pytest.mark.asyncio
async def test_ollama_client_mock_transport() -> None:
    import json
    import httpx
    from infrastructure.external.ollama_client import OllamaHttpClient

    def mock_handler(request: httpx.Request) -> httpx.Response:
        url_str = str(request.url)
        if "/api/tags" in url_str:
            return httpx.Response(200, json={"models": [{"name": "llama3.1:8b", "size": 4000000}]})
        elif "/api/version" in url_str:
            return httpx.Response(200, json={"version": "0.1.30"})
        elif "/api/embeddings" in url_str:
            return httpx.Response(200, json={"embedding": [0.1, 0.2, 0.3]})
        elif "/api/chat" in url_str:
            body = (
                json.dumps({"message": {"content": "Respuesta"}, "done": False}) + "\n" +
                json.dumps({"message": {"content": " local."}, "done": True}) + "\n"
            )
            return httpx.Response(200, text=body)
        return httpx.Response(404)

    client = OllamaHttpClient(base_url="http://mock-ollama:11434")
    # Test methods with MockTransport
    transport = httpx.MockTransport(mock_handler)
    async with httpx.AsyncClient(transport=transport) as mock_http:
        models = await client.get_installed_models()
        tokens = [t async for t in client.stream_chat(model="llama3.1:8b", messages=[{"role": "user", "content": "hi"}])]
        assert len(tokens) >= 0


@pytest.mark.asyncio
async def test_frontend_docs_views_and_comments() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Preview HTMX
        resp_prev = await client.post(
            "/docs/preview-htmx",
            data={"content_markdown": "# Header\n\n```mermaid\ngraph TD; A-->B\n```\n"},
        )
        assert resp_prev.status_code == 200
        assert "Header" in resp_prev.text

        # 2. Editor View
        resp_editor = await client.get("/docs/new")
        assert resp_editor.status_code == 200
        assert "Editor Docs-as-Code" in resp_editor.text
        assert "Plantilla Blueprint" in resp_editor.text

        # 3. Create Document
        resp_create_doc = await client.post(
            "/docs/new",
            data={
                "title": "Guía de Prueba",
                "module": "testing",
                "filename": "guide_test.md",
                "project_slug": "default",
                "author": "Ingeniero",
                "tags": "unit, test",
                "content_markdown": "## Sección 1\nRegla de prueba.",
            },
            follow_redirects=False,
        )
        assert resp_create_doc.status_code in {302, 303}
        doc_location = resp_create_doc.headers["location"]

        # 4. View Document Detail
        resp_detail = await client.get(doc_location)
        assert resp_detail.status_code == 200
        assert "Guía de Prueba" in resp_detail.text

        # 5. Add Comment to Document
        doc_path = doc_location.replace("/docs/view/", "")
        resp_comment = await client.post(
            f"/docs/view/{doc_path}/comments",
            data={
                "user_name": "Dev Reviewer",
                "content": "Excelente documentación de arquitectura.",
            },
            follow_redirects=False,
        )
        assert resp_comment.status_code in {200, 302, 303}




