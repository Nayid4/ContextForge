"""Unit tests for Taxonomy subsystem, database-backed pagination, and cross-platform CLI detection."""

from __future__ import annotations

from pathlib import Path
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from domain.taxonomy.entities import ModuleEntity, TagEntity
from infrastructure.database.orm_models import Base
from infrastructure.repositories.local_filesystem_repo import LocalFileSystemRepository
from infrastructure.repositories.sql_taxonomy_repo import SqlTaxonomyRepository
from application.knowledge_docs.handlers import GetDocumentsQueryHandler
from application.knowledge_docs.queries import GetDocumentsPagedQuery
from infrastructure.external.llm.cli_process_client import (
    CURRENT_OS,
    KNOWN_CLI_PATHS_BY_OS,
    _get_extended_search_path,
    resolve_cli_binary,
)
from main import app


@pytest.fixture
async def taxonomy_db_session(tmp_path: Path) -> AsyncSession:
    db_path = tmp_path / "test_tax.db"
    engine = create_async_engine(f"sqlite+aiosqlite:///{db_path.as_posix()}", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with session_factory() as session:
        yield session
    await engine.dispose()


@pytest.mark.asyncio
async def test_sql_taxonomy_repo_seeding_and_crud(taxonomy_db_session: AsyncSession) -> None:
    repo = SqlTaxonomyRepository(taxonomy_db_session)

    # 1. Automatic seeding on first list
    modules = await repo.list_modules()
    assert len(modules) >= 10
    assert any(m.slug == "architecture" for m in modules)
    assert any(m.slug == "billing" for m in modules)

    tags = await repo.list_tags()
    assert len(tags) >= 15
    assert any(t.slug == "clean-architecture" for t in tags)
    assert any(t.slug == "stripe" for t in tags)

    # 2. Add custom module
    custom_mod = ModuleEntity.create(
        name="Machine Learning & MLOps",
        description="Modelos y pipelines de ML",
        icon="fa-brain",
        color="purple",
    )
    saved_mod = await repo.save_module(custom_mod)
    assert saved_mod.slug == "machine_learning_&_mlops"

    fetched_mod = await repo.get_module_by_slug("machine_learning_&_mlops")
    assert fetched_mod is not None
    assert fetched_mod.name == "Machine Learning & MLOps"

    # 3. Add custom tag
    custom_tag = TagEntity.create(name="Deep Learning", color="violet")
    saved_tag = await repo.save_tag(custom_tag)
    assert saved_tag.slug == "deep-learning"

    fetched_tag = await repo.get_tag_by_slug("deep-learning")
    assert fetched_tag is not None
    assert fetched_tag.name == "Deep Learning"

    # 4. Search filtering
    searched_modules = await repo.list_modules(search="MLOps")
    assert len(searched_modules) == 1
    assert searched_modules[0].slug == "machine_learning_&_mlops"

    searched_tags = await repo.list_tags(search="Deep")
    assert len(searched_tags) == 1
    assert searched_tags[0].slug == "deep-learning"


@pytest.mark.asyncio
async def test_local_filesystem_repo_pagination(tmp_path: Path) -> None:
    docs_dir = tmp_path / "docs"
    docs_dir.mkdir(parents=True, exist_ok=True)

    # Create 15 markdown files
    for i in range(1, 16):
        mod_name = "architecture" if i <= 10 else "billing"
        p = docs_dir / mod_name
        p.mkdir(parents=True, exist_ok=True)
        (p / f"doc_{i:02d}.md").write_text(
            f"---\ntitle: Documento {i:02d}\nmodule: {mod_name}\nauthor: Dev\ntags: [test, auto]\n---\n# Doc {i}\nContenido de prueba {i}.",
            encoding="utf-8",
        )

    repo = LocalFileSystemRepository(base_path=str(docs_dir))
    handler = GetDocumentsQueryHandler(repo)

    # Page 1 (per_page=6)
    q1 = GetDocumentsPagedQuery(page=1, per_page=6)
    res1 = await handler.handle_paged(q1)
    assert res1.total_count == 15
    assert res1.page == 1
    assert res1.per_page == 6
    assert res1.total_pages == 3
    assert len(res1.items) == 6
    assert res1.has_prev is False
    assert res1.has_next is True

    # Page 2 (per_page=6)
    q2 = GetDocumentsPagedQuery(page=2, per_page=6)
    res2 = await handler.handle_paged(q2)
    assert len(res2.items) == 6
    assert res2.has_prev is True
    assert res2.has_next is True

    # Page 3 (per_page=6, remaining 3)
    q3 = GetDocumentsPagedQuery(page=3, per_page=6)
    res3 = await handler.handle_paged(q3)
    assert len(res3.items) == 3
    assert res3.has_prev is True
    assert res3.has_next is False

    # Filtered by module
    q_mod = GetDocumentsPagedQuery(module="billing", page=1, per_page=10)
    res_mod = await handler.handle_paged(q_mod)
    assert res_mod.total_count == 5
    assert len(res_mod.items) == 5
    assert res_mod.total_pages == 1


@pytest.mark.asyncio
async def test_taxonomy_api_endpoints_and_browser_rendering() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. GET /api/v1/taxonomy/modules
        r_mods = await client.get("/api/v1/taxonomy/modules")
        assert r_mods.status_code == 200
        mods_data = r_mods.json()
        assert len(mods_data) >= 10
        assert any(m["slug"] == "architecture" for m in mods_data)

        # 2. POST /api/v1/taxonomy/modules
        r_new_mod = await client.post(
            "/api/v1/taxonomy/modules",
            json={"name": "Observabilidad", "icon": "fa-chart-line", "color": "emerald"},
        )
        assert r_new_mod.status_code == 201
        assert r_new_mod.json()["slug"] == "observabilidad"

        # 3. GET /api/v1/taxonomy/tags
        r_tags = await client.get("/api/v1/taxonomy/tags")
        assert r_tags.status_code == 200
        tags_data = r_tags.json()
        assert len(tags_data) >= 15

        # 4. POST /api/v1/taxonomy/tags
        r_new_tag = await client.post(
            "/api/v1/taxonomy/tags",
            json={"name": "Grafana", "color": "orange"},
        )
        assert r_new_tag.status_code == 201
        assert r_new_tag.json()["slug"] == "grafana"

        # 5. GET /docs/browser with pagination query params
        r_browser = await client.get("/docs/browser?page=1&per_page=9")
        assert r_browser.status_code == 200
        assert "Explorador de Artículos y Especificaciones Docs-as-Code" in r_browser.text
        # Ensure no raw JS string is leaked
        assert "d.module.toLowerCase() === this.selectedModule.toLowerCase()" not in r_browser.text
        assert "Página 1 de" in r_browser.text


def test_cross_platform_cli_detection() -> None:
    # 1. System OS detected
    assert CURRENT_OS in ("Windows", "Darwin", "Linux")
    assert "Darwin" in KNOWN_CLI_PATHS_BY_OS
    assert "Linux" in KNOWN_CLI_PATHS_BY_OS
    assert "Windows" in KNOWN_CLI_PATHS_BY_OS

    # 2. Extended search path check
    extended_path = _get_extended_search_path()
    assert isinstance(extended_path, str)

    # 3. Resolution of non-existent binary returns None gracefully
    missing = resolve_cli_binary("non_existent_fake_binary_12345")
    assert missing is None

