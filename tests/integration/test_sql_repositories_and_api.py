"""Integration tests for Decoupled SQL Repositories, Adapters, and v1 REST Routers."""

from __future__ import annotations

import io
from pathlib import Path
from typing import AsyncGenerator
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from main import app
from domain.catalog.entities import Book, Library
from domain.book_registry.entities import Attachment, HeadingBlock, ParagraphBlock, CodeBlock, MermaidBlock
from domain.social.entities import Comment, Rating
from domain.chat.entities import ChatMessage, ScopedChatSession
from infrastructure.persistence.models.base_model import Base
from infrastructure.repositories.sql_catalog_repo import SqlLibraryRepository, SqlBookRepository
from infrastructure.repositories.sql_book_registry_repo import SqlAttachmentRepository, InMemoryDraftBookRepository
from infrastructure.repositories.sql_social_repo import SqlSocialRepository
from infrastructure.repositories.sql_chat_repo import SqlChatSessionRepository
from infrastructure.external.markdown.block_serializer import BlockSerializer
from infrastructure.external.markdown.frontmatter_parser import FrontmatterParser


@pytest.fixture
async def memory_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide an isolated in-memory SQLite session for testing SQL repositories."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_maker = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with session_maker() as session:
        yield session

    await engine.dispose()


# =====================================================================
# 1. SQL Catalog Repositories (Library & Book)
# =====================================================================

@pytest.mark.asyncio
async def test_sql_library_repository(memory_db_session: AsyncSession) -> None:
    repo = SqlLibraryRepository(memory_db_session)

    # Save libraries
    lib1 = Library(slug="fintech", name="FinTech Core", is_active=False)
    lib2 = Library(slug="health", name="HealthTech API", is_active=True)
    await repo.save(lib1)
    await repo.save(lib2)

    # List all
    all_libs = await repo.list_all()
    assert len(all_libs) == 2

    # Get by slug
    fetched = await repo.get_by_slug("fintech")
    assert fetched is not None
    assert fetched.name == "FinTech Core"

    # Get active
    active = await repo.get_active()
    assert active is not None
    assert active.slug == "health"

    # Set active
    await repo.set_active("fintech")
    active_updated = await repo.get_active()
    assert active_updated is not None
    assert active_updated.slug == "fintech"

    # Delete
    deleted = await repo.delete("health")
    assert deleted is True
    assert await repo.get_by_slug("health") is None


@pytest.mark.asyncio
async def test_sql_book_repository(memory_db_session: AsyncSession) -> None:
    # First ensure a library exists for foreign key / consistency
    lib_repo = SqlLibraryRepository(memory_db_session)
    await lib_repo.save(Library(slug="core", name="Core System"))

    repo = SqlBookRepository(memory_db_session)

    book = Book(
        id="book-auth",
        slug="oauth2-flow",
        title="OAuth2 Specification",
        library_slug="core",
        module_name="auth",
        path="auth/oauth2.md",
        summary="OAuth2 architecture and scopes",
        tags=["security", "auth"],
        status="draft",
    )
    await repo.save(book)

    # Get by ID
    by_id = await repo.get_by_id("book-auth")
    assert by_id is not None
    assert by_id.title == "OAuth2 Specification"
    assert by_id.status == "draft"

    # Get by path
    by_path = await repo.get_by_path("core", "auth/oauth2.md")
    assert by_path is not None
    assert by_path.id == "book-auth"

    # List by library
    by_lib = await repo.list_by_library("core")
    assert len(by_lib) == 1

    # List all
    all_books = await repo.list_all()
    assert len(all_books) >= 1

    # Update status
    book.update_status("published")
    await repo.save(book)
    updated = await repo.get_by_id("book-auth")
    assert updated is not None and updated.status == "published"

    # Delete
    deleted = await repo.delete("book-auth")
    assert deleted is True
    assert await repo.get_by_id("book-auth") is None


# =====================================================================
# 2. SQL Social Repository (Comments & Ratings)
# =====================================================================

@pytest.mark.asyncio
async def test_sql_social_repository(memory_db_session: AsyncSession) -> None:
    repo = SqlSocialRepository(memory_db_session)

    comment = Comment(
        id="comm-1",
        target_id="modules/billing/retry_policy.md",
        user_name="Architect",
        user_email="arch@example.com",
        content="Document clarifies transient errors well.",
    )
    saved = await repo.add_comment(comment)
    assert saved.id == "comm-1"

    # List comments
    comments = await repo.get_comments_for_target("modules/billing/retry_policy.md")
    assert len(comments) == 1
    assert comments[0].user_name == "Architect"

    # Add rating
    rating = Rating(
        id="rate-1",
        target_id="modules/billing/retry_policy.md",
        user_name="Senior Engineer",
        score=5,
    )
    await repo.add_rating(rating)
    ratings = await repo.get_ratings_for_target("modules/billing/retry_policy.md")
    assert len(ratings) == 1
    assert ratings[0].score == 5

    # Delete comment
    del_ok = await repo.delete_comment("comm-1")
    assert del_ok is True
    assert len(await repo.get_comments_for_target("modules/billing/retry_policy.md")) == 0


# =====================================================================
# 3. SQL Attachment Repository & In-Memory Drafts
# =====================================================================

@pytest.mark.asyncio
async def test_sql_attachment_repository(memory_db_session: AsyncSession) -> None:
    repo = SqlAttachmentRepository(memory_db_session)

    att = Attachment(
        id="att-1",
        book_id="core/auth/oauth2",
        file_name="flow.png",
        file_path="assets/oauth2/flow.png",
        mime_type="image/png",
        size_bytes=1024,
    )
    await repo.save_attachment(att)

    # Get by ID
    fetched = await repo.get_attachment("att-1")
    assert fetched is not None
    assert fetched.file_name == "flow.png"

    # List for book
    att_list = await repo.list_attachments_for_book("core/auth/oauth2")
    assert len(att_list) == 1

    # Delete
    del_res = await repo.delete_attachment("att-1")
    assert del_res is True
    assert await repo.get_attachment("att-1") is None


# =====================================================================
# 4. SQL Chat Session Repository
# =====================================================================

@pytest.mark.asyncio
async def test_sql_chat_session_repository(memory_db_session: AsyncSession) -> None:
    repo = SqlChatSessionRepository(memory_db_session)

    session = ScopedChatSession(
        session_id="sess-rag-1",
        book_id="modules/billing/retry_policy.md",
        library_id="core",
    )
    await repo.save_session(session)

    # Append user message
    u_msg = ChatMessage(id="msg-1", role="user", content="¿Cuáles son los timeouts?")
    await repo.append_message("sess-rag-1", u_msg)

    # Append assistant message
    a_msg = ChatMessage(id="msg-2", role="assistant", content="Los timeouts son de 2, 15 y 60 segundos.")
    await repo.append_message("sess-rag-1", a_msg)

    # Retrieve session
    fetched = await repo.get_session("sess-rag-1")
    assert fetched is not None
    assert len(fetched.messages) == 2
    assert fetched.messages[0].role == "user"
    assert fetched.messages[1].role == "assistant"

    # List for book
    book_sessions = await repo.list_sessions_for_book("modules/billing/retry_policy.md")
    assert len(book_sessions) == 1


# =====================================================================
# 5. External Adapters (BlockSerializer & FrontmatterParser)
# =====================================================================

def test_external_markdown_adapters() -> None:
    from domain.book_registry.entities import DocumentBlock

    blocks: list[DocumentBlock] = [
        HeadingBlock(level=2, text="Arquitectura de Pagos"),
        ParagraphBlock(text="Flujo transaccional."),
        CodeBlock(language="json", code='{"status": 200}'),
        MermaidBlock(code="graph LR\nA-->B"),
    ]
    md = BlockSerializer.blocks_to_markdown(
        title="Documento Compilado",
        module="pagos",
        library_id="core",
        tags=["pagos", "rest"],
        description="Descripción técnica",
        blocks=blocks,
    )
    assert md.startswith("---")
    assert "title: Documento Compilado" in md
    assert "## Arquitectura de Pagos" in md
    assert "```json" in md
    assert "```mermaid" in md

    # Parse back using FrontmatterParser
    meta, body = FrontmatterParser.extract_frontmatter(md)
    assert meta["title"] == "Documento Compilado"
    assert meta["module"] == "pagos"
    assert "## Arquitectura de Pagos" in body


# =====================================================================
# 6. REST API v1 Routers E2E Integration
# =====================================================================

@pytest.mark.asyncio
async def test_api_v1_catalog_social_chat_routers() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Catalog Router: list libraries
        lib_res = await client.get("/api/v1/catalog/libraries")
        assert lib_res.status_code == 200
        assert "libraries" in lib_res.json()

        # 2. Catalog Router: list books
        books_res = await client.get("/api/v1/catalog/books")
        assert books_res.status_code == 200
        assert "books" in books_res.json()

        # 3. Social Router: post comment
        comment_res = await client.post(
            "/api/v1/social/comments",
            json={
                "target_id": "modules/billing/retry_policy.md",
                "user_name": "API Reviewer",
                "user_email": "rev@example.com",
                "content": "Aprobado por el equipo de arquitectura.",
            },
        )
        assert comment_res.status_code == 201
        data = comment_res.json()
        assert data["success"] is True
        c_id = data["comment_id"]

        # Get comments
        get_c_res = await client.get("/api/v1/social/comments?target_id=modules/billing/retry_policy.md")
        assert get_c_res.status_code == 200
        assert get_c_res.json()["count"] >= 1

        # Delete comment
        del_c_res = await client.delete(f"/api/v1/social/comments/{c_id}")
        assert del_c_res.status_code == 200
        assert del_c_res.json()["success"] is True

        # 4. Chat Router: ask scoped document (with raw markdown)
        ask_res = await client.post(
            "/api/v1/chat/scoped",
            json={
                "library_id": "core",
                "book_id": "modules/billing/retry_policy.md",
                "query": "¿Cuántos reintentos se aplican?",
                "raw_markdown": "# Reintentos\n\nSe aplican exactamente 3 reintentos con backoff exponencial.",
            },
        )
        assert ask_res.status_code == 200
        assert "answer" in ask_res.json()

        # 5. Chat Router: send message in session and get history
        import uuid
        unique_session_id = f"test-e2e-{uuid.uuid4()}"
        send_res = await client.post(
            "/api/v1/chat/messages",
            json={
                "session_id": unique_session_id,
                "library_id": "core",
                "book_id": "modules/billing/retry_policy.md",
                "user_message": "Explica la política.",
                "raw_markdown": "# Reintentos\n\nRegla de reintentos.",
            },
        )
        assert send_res.status_code == 200
        assert "assistant_response" in send_res.json()

        hist_res = await client.get(f"/api/v1/chat/session/{unique_session_id}")
        assert hist_res.status_code == 200
        assert hist_res.json()["count"] == 2

        # 6. Registry: compile blocks
        compile_res = await client.post(
            "/api/v1/books/compile-blocks",
            json={
                "library_id": "core",
                "module": "payments",
                "title": "Protocolo de Pagos",
                "tags": ["pagos"],
                "blocks": [
                    {"type": "heading", "level": 1, "text": "Protocolo de Pagos"},
                    {"type": "paragraph", "text": "Detalle de pasarela."},
                ],
            },
        )
        assert compile_res.status_code == 200
        assert "raw_markdown" in compile_res.json()
        assert "Protocolo de Pagos" in compile_res.json()["raw_markdown"]
