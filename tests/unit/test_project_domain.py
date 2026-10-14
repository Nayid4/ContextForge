"""Unit tests for Project Domain, Value Objects, and SQLite Persistence Model."""

from __future__ import annotations

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from core.domain.document import Document, DocumentChunk, FrontmatterMetadata
from core.domain.project import Project, ProjectSlug
from infrastructure.persistence.migrations import apply_migrations, seed_initial_project
from infrastructure.persistence.orm_models import Base, ProjectORM


class TestProjectSlug:
    """Test suite for ProjectSlug Value Object."""

    def test_valid_slugs(self) -> None:
        valid_cases = ["iuristrack", "mesa-servicio-upc", "core_backend", "crm2", "a", "alpha-beta_1"]
        for val in valid_cases:
            slug = ProjectSlug(val)
            assert str(slug) == val.lower()
            assert slug.value == val.lower()

    def test_normalization_lowercases_and_trims(self) -> None:
        slug = ProjectSlug("  IurisTrack-PROD  ")
        assert slug.value == "iuristrack-prod"
        assert str(slug) == "iuristrack-prod"

    def test_equality_and_hash(self) -> None:
        slug1 = ProjectSlug("project-a")
        slug2 = ProjectSlug("project-a")
        slug3 = ProjectSlug("project-b")

        assert slug1 == slug2
        assert slug1 != slug3
        assert len({slug1, slug2, slug3}) == 2

    def test_empty_slug_raises_error(self) -> None:
        with pytest.raises(ValueError, match="no puede estar vacío"):
            ProjectSlug("")
        with pytest.raises(ValueError, match="no puede estar vacío"):
            ProjectSlug("   ")

    def test_too_long_slug_raises_error(self) -> None:
        with pytest.raises(ValueError, match="supera los 50 caracteres"):
            ProjectSlug("a" * 51)

    @pytest.mark.parametrize(
        "invalid_input",
        [
            "-leading-dash",
            "trailing-dash-",
            "_leading_underscore",
            "trailing_underscore_",
            "has space",
            "has@symbol",
            "has/slash",
            "has.dot",
        ],
    )
    def test_invalid_characters_raise_error(self, invalid_input: str) -> None:
        with pytest.raises(ValueError, match="inválido"):
            ProjectSlug(invalid_input)


class TestProjectEntity:
    """Test suite for Project Domain Entity."""

    def test_create_project_with_explicit_slug(self) -> None:
        project = Project.create(
            name="Mesa de Servicio UPC",
            slug="mesa-servicio-upc",
            description="Sistema de tickets y soporte",
        )
        assert project.slug.value == "mesa-servicio-upc"
        assert project.name == "Mesa de Servicio UPC"
        assert project.description == "Sistema de tickets y soporte"
        assert project.path == "./docs/mesa-servicio-upc"
        assert not project.is_active
        assert project.collection_name == "cf_project_mesa-servicio-upc"

    def test_create_project_auto_generates_slug(self) -> None:
        project = Project.create(name="IurisTrack Core Platform")
        assert project.slug.value == "iuristrack-core-platform"
        assert project.path == "./docs/iuristrack-core-platform"

    def test_empty_name_raises_error(self) -> None:
        with pytest.raises(ValueError, match="no puede estar vacío"):
            Project.create(name="   ", slug="test-slug")

    def test_activate_and_deactivate(self) -> None:
        project = Project.create(name="Test Project", slug="test-project")
        assert not project.is_active

        initial_updated_at = project.updated_at
        project.activate()
        assert project.is_active
        assert project.updated_at >= initial_updated_at

        project.deactivate()
        assert not project.is_active

    def test_to_dict_and_from_dict_serialization(self) -> None:
        project = Project.create(
            name="IurisTrack",
            slug="iuristrack",
            description="LegalTech RAG Knowledge Base",
            path="./docs/iuristrack",
            is_active=True,
        )

        data = project.to_dict()
        assert data["slug"] == "iuristrack"
        assert data["name"] == "IurisTrack"
        assert data["is_active"] is True
        assert data["path"] == "./docs/iuristrack"

        reconstructed = Project.from_dict(data)
        assert reconstructed.slug == project.slug
        assert reconstructed.name == project.name
        assert reconstructed.is_active == project.is_active
        assert reconstructed.path == project.path


class TestDocumentMultiProjectSupport:
    """Test suite for Document entities multi-project attributes."""

    def test_document_and_chunks_carry_project_slug(self) -> None:
        chunk = DocumentChunk(
            project_slug="iuristrack",
            document_path="cases/sync_flow.md",
            header_hierarchy=["Casos Judiciales", "Sincronización"],
            header_level="h2",
            text="Detalle del flujo con reintentos.",
            module="cases",
            tags=["sync", "retry"],
        )

        meta_dict = chunk.to_metadata_dict()
        assert meta_dict["project"] == "iuristrack"
        assert meta_dict["module"] == "cases"
        assert meta_dict["file_path"] == "cases/sync_flow.md"
        assert meta_dict["title"] == "Sincronización"
        assert meta_dict["header_level"] == "h2"
        assert meta_dict["tags"] == "sync,retry"

        doc = Document(
            project_slug="iuristrack",
            path="cases/sync_flow.md",
            title="Sincronización de Expedientes",
            module="cases",
            chunks=[chunk],
        )
        assert doc.project_slug == "iuristrack"
        assert len(doc.chunks) == 1
        assert doc.chunks[0].project_slug == "iuristrack"

    def test_frontmatter_metadata_includes_project_slug(self) -> None:
        fm = FrontmatterMetadata(
            title="ADR 001",
            module="architecture",
            project_slug="mesa-servicio",
            tags=["adr"],
        )
        assert fm.project_slug == "mesa-servicio"


@pytest.mark.asyncio
class TestProjectPersistence:
    """Test suite for SQLite ProjectORM and migrations in-memory."""

    async def test_project_orm_crud(self) -> None:
        engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
        await apply_migrations(engine)

        session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
        async with session_factory() as session:
            # 1. Insert project
            orm_project = ProjectORM(
                slug="iuristrack",
                name="IurisTrack Legal",
                description="Plataforma de gestión judicial",
                path="./docs/iuristrack",
                is_active=True,
            )
            session.add(orm_project)
            await session.commit()

            # 2. Query project
            query = select(ProjectORM).where(ProjectORM.slug == "iuristrack")
            res = await session.execute(query)
            saved = res.scalars().first()

            assert saved is not None
            assert saved.slug == "iuristrack"
            assert saved.name == "IurisTrack Legal"
            assert saved.is_active is True

            # 3. Seed initial project
            default_proj = await seed_initial_project(session)
            assert default_proj.slug == "default"

            # 4. Repeat seed returns same without duplicate error
            repeat_proj = await seed_initial_project(session)
            assert repeat_proj.slug == "default"

        await engine.dispose()

