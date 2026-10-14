"""Targeted coverage tests to exceed 90% test coverage gate for FASE 5."""

from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock
import pytest
from httpx import ASGITransport, AsyncClient

from core.domain.project import IProjectRepository, Project, ProjectSlug
from domain.shared_kernel.entities import Entity
from domain.shared_kernel.exceptions import (
    BusinessRuleViolationException,
    DomainException,
    EntityNotFoundException,
    ValidationException,
)
from infrastructure.database.unit_of_work import SqlAlchemyUnitOfWork
from infrastructure.repositories.sqlite_project_repo import SqliteProjectRepository
from main import app


@pytest.mark.asyncio
async def test_project_repository_interface_default_methods() -> None:
    repo = IProjectRepository()

    with pytest.raises(NotImplementedError):
        await repo.get_by_slug("slug")

    with pytest.raises(NotImplementedError):
        await repo.list_all()

    with pytest.raises(NotImplementedError):
        await repo.save(Project.create(name="test"))

    with pytest.raises(NotImplementedError):
        await repo.delete("slug")

    with pytest.raises(NotImplementedError):
        await repo.get_active()

    with pytest.raises(NotImplementedError):
        await repo.set_active("slug")


def test_project_domain_repr_and_slug_object() -> None:
    slug = ProjectSlug("billing-core")
    assert repr(slug) == "ProjectSlug('billing-core')"

    # Factory method with ProjectSlug object passed directly
    proj = Project.create(name="Billing Core", slug=slug)
    assert proj.slug.value == "billing-core"

    # Default path assignment when path is empty string
    proj_empty_path = Project(slug=ProjectSlug("empty"), name="Empty Project", path="")
    assert proj_empty_path.path == "./docs/empty"


def test_shared_kernel_entity_and_exceptions() -> None:
    e1 = Entity()
    e2 = Entity(id=e1.id)
    e3 = Entity()

    assert e1 == e2
    assert e1 != e3
    assert e1 != "string-not-entity"
    assert hash(e1) == hash(e2)

    # Exceptions
    d_exc = DomainException("Generic domain error", status_code=400)
    assert d_exc.status_code == 400
    assert str(d_exc) == "Generic domain error"

    nf_exc = EntityNotFoundException("Entity 123 missing")
    assert nf_exc.status_code == 404

    val_exc = ValidationException("Invalid format")
    assert val_exc.status_code == 422

    biz_exc = BusinessRuleViolationException("Rule conflict")
    assert biz_exc.status_code == 409


@pytest.mark.asyncio
async def test_sqlalchemy_unit_of_work() -> None:
    mock_session = AsyncMock()
    uow = SqlAlchemyUnitOfWork(mock_session)

    async with uow:
        await uow.commit()
        await uow.rollback()

    mock_session.commit.assert_awaited_once()
    mock_session.rollback.assert_awaited_once()

    # Test rollback on exception exit
    with pytest.raises(RuntimeError):
        async with uow:
            raise RuntimeError("DB error")


@pytest.mark.asyncio
async def test_sqlite_project_repo_edge_cases(tmp_path: Path) -> None:
    # Test _discover_from_filesystem when docs path does not exist
    non_existent_path = tmp_path / "does_not_exist"
    mock_session = AsyncMock()
    repo = SqliteProjectRepository(session=mock_session, docs_base_path=str(non_existent_path))

    discovered = repo._discover_from_filesystem()
    assert len(discovered) == 1
    assert discovered[0].slug.value == "default"

    # Test _discover_from_filesystem with corrupt project.json
    corrupt_dir = tmp_path / "corrupt_proj"
    corrupt_dir.mkdir(parents=True, exist_ok=True)
    bad_meta = corrupt_dir / "project.json"
    bad_meta.write_text("{invalid json:", encoding="utf-8")

    valid_dir = tmp_path / "valid_proj"
    valid_dir.mkdir(parents=True, exist_ok=True)
    good_meta = valid_dir / "project.json"
    good_meta.write_text(json.dumps({"name": "Custom Valid", "description": "Desc"}), encoding="utf-8")

    repo2 = SqliteProjectRepository(session=mock_session, docs_base_path=str(tmp_path))
    discovered2 = repo2._discover_from_filesystem()
    slugs = [p.slug.value for p in discovered2]
    assert "corrupt_proj" in slugs
    assert "valid_proj" in slugs


@pytest.mark.asyncio
async def test_projects_frontend_routes_edge_cases(tmp_path: Path) -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create project with make_active=False
        resp = await client.post(
            "/projects/new",
            data={
                "name": "Inactive Proj",
                "slug": "inactive-proj",
                "description": "Inactive desc",
                "make_active": "false",
            },
            follow_redirects=False,
        )
        assert resp.status_code == 302

        # Create project again when README already exists
        resp_existing = await client.post(
            "/projects/new",
            data={
                "name": "Inactive Proj",
                "slug": "inactive-proj",
                "description": "Inactive desc",
                "make_active": "false",
            },
            follow_redirects=False,
        )
        assert resp_existing.status_code == 302

        # Switch project via HTMX request
        resp_htmx = await client.post(
            "/ui/projects/switch",
            data={"project_slug": "inactive-proj"},
            headers={"HX-Request": "true"},
        )
        assert resp_htmx.status_code == 200
        assert resp_htmx.headers.get("HX-Refresh") == "true"

        # Switch project standard non-HTMX
        resp_std = await client.post(
            "/ui/projects/switch",
            data={"project_slug": "inactive-proj"},
            follow_redirects=False,
        )
        assert resp_std.status_code == 303


@pytest.mark.asyncio
async def test_settings_frontend_routes() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # GET /settings
        resp = await client.get("/settings")
        assert resp.status_code == 200

        # POST /settings update
        resp_post = await client.post(
            "/settings",
            data={
                "active_llm_model": "llama3.1:8b",
                "ollama_url": "http://localhost:11434",
                "docs_path": "./docs",
                "embedding_model": "nomic-embed-text",
                "temperature": "0.3",
            },
            follow_redirects=False,
        )
        assert resp_post.status_code in (200, 302, 303)

