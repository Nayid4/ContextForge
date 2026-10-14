"""Unit tests for Granular CQRS Handlers, Queries, Commands, Validators, and Mappers."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any
from unittest.mock import AsyncMock, MagicMock
import pytest

from application.catalog.commands.update_book_status.command import UpdateBookStatusCommand
from application.catalog.commands.update_book_status.handler import UpdateBookStatusHandler
from application.catalog.commands.update_book_status.validator import UpdateBookStatusValidator
from application.catalog.queries.get_books.query import GetBooksQuery
from application.catalog.queries.get_books.handler import GetBooksHandler
from application.catalog.queries.get_books.validator import GetBooksValidator
from application.catalog.queries.get_library_catalog.query import GetLibraryCatalogQuery
from application.catalog.queries.get_library_catalog.handler import GetLibraryCatalogHandler
from application.catalog.queries.get_library_catalog.validator import GetLibraryCatalogValidator

from application.book_registry.commands.create_book_from_blocks.command import CreateBookFromBlocksCommand
from application.book_registry.commands.create_book_from_blocks.handler import CreateBookFromBlocksHandler
from application.book_registry.commands.create_book_from_blocks.validator import CreateBookFromBlocksValidator
from application.book_registry.commands.save_raw_markdown.command import SaveRawMarkdownCommand
from application.book_registry.commands.save_raw_markdown.handler import SaveRawMarkdownHandler
from application.book_registry.commands.save_raw_markdown.validator import SaveRawMarkdownValidator
from application.book_registry.commands.upload_attachment.command import UploadAttachmentCommand
from application.book_registry.commands.upload_attachment.handler import UploadAttachmentHandler
from application.book_registry.commands.upload_attachment.validator import UploadAttachmentValidator
from application.book_registry.queries.get_book_draft.query import GetBookDraftQuery
from application.book_registry.queries.get_book_draft.handler import GetBookDraftHandler
from application.book_registry.queries.get_book_draft.validator import GetBookDraftValidator
from application.book_registry.queries.get_doc_templates.query import GetDocTemplatesQuery
from application.book_registry.queries.get_doc_templates.handler import GetDocTemplatesHandler
from application.book_registry.queries.get_doc_templates.validator import GetDocTemplatesValidator

from application.social.commands.add_comment.command import AddCommentCommand
from application.social.commands.add_comment.handler import AddCommentHandler
from application.social.commands.add_comment.validator import AddCommentValidator
from application.social.commands.moderate_comment.command import ModerateCommentCommand
from application.social.commands.moderate_comment.handler import ModerateCommentHandler
from application.social.commands.moderate_comment.validator import ModerateCommentValidator
from application.social.queries.get_book_comments.query import GetBookCommentsQuery
from application.social.queries.get_book_comments.handler import GetBookCommentsHandler
from application.social.queries.get_book_comments.validator import GetBookCommentsValidator

from application.chat.commands.send_scoped_message.command import SendScopedMessageCommand
from application.chat.commands.send_scoped_message.handler import SendScopedMessageHandler
from application.chat.commands.send_scoped_message.validator import SendScopedMessageValidator
from application.chat.queries.get_chat_history.query import GetChatHistoryQuery
from application.chat.queries.get_chat_history.handler import GetChatHistoryHandler
from application.chat.queries.get_chat_history.validator import GetChatHistoryValidator
from application.chat.queries.ask_scoped_document.query import AskScopedDocumentQuery
from application.chat.queries.ask_scoped_document.handler import AskScopedDocumentHandler
from application.chat.queries.ask_scoped_document.validator import AskScopedDocumentValidator

from application.commons.behaviors.validator_behavior import ValidationBehavior
from application.commons.behaviors.logging_behavior import LoggingBehavior
from application.commons.behaviors.transaction_behavior import TransactionBehavior
from application.commons.exceptions.application_exceptions import NotFoundException, ValidationException
from application.commons.interfaces.unit_of_work import IUnitOfWork

from application.mappers.catalog_mapper import CatalogMapper
from application.mappers.book_registry_mapper import BookRegistryMapper
from application.mappers.social_mapper import SocialMapper
from application.mappers.chat_mapper import ChatMapper

from domain.catalog.entities import Book, Library
from domain.catalog.repositories import IBookRepository, ILibraryRepository
from domain.book_registry.entities import Attachment, DraftBook, HeadingBlock, ParagraphBlock
from domain.book_registry.repositories import IAttachmentRepository, IBookRegistryRepository
from domain.social.entities import Comment, Rating
from domain.social.repositories import ISocialRepository
from domain.chat.entities import ChatMessage, DocumentSourceRef, ScopedChatSession
from domain.chat.repositories import IChatSessionRepository
from application.chat.services import ScopedChatService


# =====================================================================
# Catalog CQRS Unit Tests
# =====================================================================

class FakeBookRepository(IBookRepository):
    def __init__(self) -> None:
        self.books: dict[str, Book] = {}

    async def get_by_id(self, book_id: str) -> Book | None:
        return self.books.get(book_id)

    async def get_by_path(self, library_slug: str, relative_path: str) -> Book | None:
        for b in self.books.values():
            if b.library_slug == library_slug and b.path == relative_path:
                return b
        return None

    async def list_all(self) -> list[Book]:
        return list(self.books.values())

    async def list_by_library(self, library_slug: str) -> list[Book]:
        return [b for b in self.books.values() if b.library_slug == library_slug]

    async def save(self, book: Book) -> Book:
        self.books[book.id] = book
        return book

    async def delete(self, book_id: str) -> bool:
        if book_id in self.books:
            del self.books[book_id]
            return True
        return False


class FakeLibraryRepository(ILibraryRepository):
    def __init__(self) -> None:
        self.libraries: dict[str, Library] = {}

    async def get_by_slug(self, slug: str) -> Library | None:
        return self.libraries.get(slug)

    async def get_active(self) -> Library | None:
        for lib in self.libraries.values():
            if lib.is_active:
                return lib
        return None

    async def list_all(self) -> list[Library]:
        return list(self.libraries.values())

    async def save(self, library: Library) -> Library:
        self.libraries[library.slug] = library
        return library

    async def set_active(self, slug: str) -> bool:
        for lib in self.libraries.values():
            lib.is_active = (lib.slug == slug)
        return slug in self.libraries

    async def delete(self, slug: str) -> bool:
        if slug in self.libraries:
            del self.libraries[slug]
            return True
        return False



@pytest.mark.asyncio
async def test_update_book_status_success() -> None:
    repo = FakeBookRepository()
    book = Book(
        id="book-123",
        slug="retry-policy",
        library_slug="fintech",
        module_name="billing",
        title="Payment Retry Policy",
        path="billing/retry.md",
        status="draft",
    )
    await repo.save(book)

    handler = UpdateBookStatusHandler(repo)
    command = UpdateBookStatusCommand(book_id="book-123", new_status="published")
    res = await handler.handle(command)

    assert res.success is True
    assert res.status == "published"
    updated = await repo.get_by_id("book-123")
    assert updated is not None and updated.status == "published"


@pytest.mark.asyncio
async def test_update_book_status_not_found() -> None:
    repo = FakeBookRepository()
    handler = UpdateBookStatusHandler(repo)
    command = UpdateBookStatusCommand(book_id="non-existent", new_status="published")
    with pytest.raises(NotFoundException):
        await handler.handle(command)


def test_update_book_status_validator() -> None:
    validator = UpdateBookStatusValidator()
    with pytest.raises(ValidationException):
        validator.validate(UpdateBookStatusCommand(book_id="", new_status="published"))
    with pytest.raises(ValidationException):
        validator.validate(UpdateBookStatusCommand(book_id="b1", new_status="invalid_status"))


@pytest.mark.asyncio
async def test_get_books_handler() -> None:
    repo = FakeBookRepository()
    b1 = Book(id="b1", slug="b1", library_slug="lib1", module_name="mod1", title="Book 1", path="mod1/b1.md")
    b2 = Book(id="b2", slug="b2", library_slug="lib2", module_name="mod2", title="Book 2", path="mod2/b2.md")
    await repo.save(b1)
    await repo.save(b2)

    handler = GetBooksHandler(repo)
    # All books
    res_all = await handler.handle(GetBooksQuery())
    assert res_all.count == 2
    # Filtered
    res_filtered = await handler.handle(GetBooksQuery(library_slug="lib1"))
    assert res_filtered.count == 1
    assert res_filtered.books[0]["id"] == "b1"


@pytest.mark.asyncio
async def test_get_library_catalog_handler() -> None:
    repo = FakeLibraryRepository()
    l1 = Library(slug="core", name="Core Lib", is_active=True)
    l2 = Library(slug="secondary", name="Secondary Lib", is_active=False)
    await repo.save(l1)
    await repo.save(l2)

    handler = GetLibraryCatalogHandler(repo)
    res = await handler.handle(GetLibraryCatalogQuery())
    assert len(res.libraries) == 2
    assert res.active_library is not None
    assert res.active_library["slug"] == "core"


# =====================================================================
# Book Registry CQRS Unit Tests
# =====================================================================

@pytest.mark.asyncio
async def test_create_book_from_blocks(tmp_path: Path) -> None:
    handler = CreateBookFromBlocksHandler(docs_base_path=str(tmp_path))
    command = CreateBookFromBlocksCommand(
        library_id="testlib",
        module="architecture",
        title="Architecture Guide",
        doc_name="arch_guide.md",
        tags=["core", "ddd"],
        description="A comprehensive DDD architecture guide",
        blocks=[
            {"type": "heading", "level": 1, "text": "Domain Overview"},
            {"type": "paragraph", "text": "This document outlines bounded contexts."},
            {"type": "code", "language": "python", "code": "def process(): pass"},
            {"type": "mermaid", "code": "graph TD\nA-->B"},
            {
                "type": "attachment",
                "file_name": "diagram.png",
                "file_path": "assets/arch_guide/diagram.png",
                "mime_type": "image/png",
                "is_image": True,
            },
        ],
    )
    res = await handler.handle(command)
    assert res.success is True
    assert "arch_guide.md" in res.file_path
    assert os.path.exists(res.file_path)

    content = Path(res.file_path).read_text(encoding="utf-8")
    assert "Domain Overview" in content
    assert "bounded contexts" in content
    assert "```python" in content
    assert "```mermaid" in content
    assert "![diagram.png]" in content


def test_create_book_from_blocks_validator() -> None:
    validator = CreateBookFromBlocksValidator()
    with pytest.raises(ValidationException):
        validator.validate(CreateBookFromBlocksCommand(library_id="", module="mod", title="Title", blocks=[]))
    with pytest.raises(ValidationException):
        validator.validate(CreateBookFromBlocksCommand(library_id="lib", module="mod", title="", blocks=[]))



@pytest.mark.asyncio
async def test_save_raw_markdown(tmp_path: Path) -> None:
    handler = SaveRawMarkdownHandler(docs_base_path=str(tmp_path))
    command = SaveRawMarkdownCommand(
        library_id="lib",
        module="api",
        doc_name="endpoints",
        raw_markdown="# API Endpoints\n\nGET /users",
    )
    res = await handler.handle(command)
    assert res.success is True
    assert res.file_path.endswith("endpoints.md")
    assert os.path.exists(res.file_path)
    assert "GET /users" in Path(res.file_path).read_text(encoding="utf-8")


def test_save_raw_markdown_validator() -> None:
    validator = SaveRawMarkdownValidator()
    with pytest.raises(ValidationException):
        validator.validate(SaveRawMarkdownCommand(library_id="lib", module="mod", doc_name="doc.md", raw_markdown=""))
    with pytest.raises(ValidationException):
        validator.validate(SaveRawMarkdownCommand(library_id="lib", module="mod", doc_name="", raw_markdown="# Content"))


class FakeAttachmentRepository(IAttachmentRepository):
    def __init__(self) -> None:
        self.attachments: dict[str, Attachment] = {}

    async def save_attachment(self, attachment: Attachment) -> Attachment:
        self.attachments[attachment.id] = attachment
        return attachment

    async def get_attachment(self, attachment_id: str) -> Attachment | None:
        return self.attachments.get(attachment_id)

    async def list_attachments_for_book(self, book_id: str) -> list[Attachment]:
        return [a for a in self.attachments.values() if a.book_id == book_id]

    async def delete_attachment(self, attachment_id: str) -> bool:
        if attachment_id in self.attachments:
            del self.attachments[attachment_id]
            return True
        return False



@pytest.mark.asyncio
async def test_upload_attachment(tmp_path: Path) -> None:
    repo = FakeAttachmentRepository()
    handler = UploadAttachmentHandler(attachment_repo=repo, docs_base_path=str(tmp_path))
    command = UploadAttachmentCommand(
        library_id="my_lib",
        doc_name="my_doc.md",
        file_name="spec.pdf",
        content_bytes=b"%PDF-1.4 test bytes",
        mime_type="application/pdf",
    )
    res = await handler.handle(command)
    assert res.file_name == "spec.pdf"
    assert res.is_image is False
    assert res.size_bytes == len(b"%PDF-1.4 test bytes")

    saved_att = await repo.get_attachment(res.attachment_id)
    assert saved_att is not None
    assert saved_att.file_name == "spec.pdf"


class FakeDraftBookRepository(IBookRegistryRepository):
    def __init__(self) -> None:
        self.drafts: dict[str, DraftBook] = {}

    async def save_draft(self, draft: DraftBook) -> DraftBook:
        self.drafts[draft.id] = draft
        return draft

    async def get_draft(self, draft_id: str) -> DraftBook | None:
        return self.drafts.get(draft_id)

    async def delete_draft(self, draft_id: str) -> bool:
        if draft_id in self.drafts:
            del self.drafts[draft_id]
            return True
        return False


@pytest.mark.asyncio
async def test_get_book_draft_handler() -> None:
    draft_repo = FakeDraftBookRepository()
    draft = DraftBook(
        id="draft-1",
        library_id="lib1",
        module="testing",
        title="Draft Title",
        description="A draft description",
        tags=["draft"],
        raw_markdown="# Draft Content",
    )
    await draft_repo.save_draft(draft)

    handler = GetBookDraftHandler(draft_repo)
    # Found
    res = await handler.handle(GetBookDraftQuery(draft_id="draft-1"))
    assert res.found is True
    assert res.draft is not None
    assert res.draft["title"] == "Draft Title"

    # Not found
    res_none = await handler.handle(GetBookDraftQuery(draft_id="non-existent"))
    assert res_none.found is False
    assert res_none.draft is None


@pytest.mark.asyncio
async def test_get_doc_templates_handler() -> None:
    handler = GetDocTemplatesHandler()
    res = await handler.handle(GetDocTemplatesQuery())
    assert len(res.templates) >= 4
    categories = {t["category"].lower() for t in res.templates}
    assert "arquitectura" in categories or "negocio" in categories

    # Filtered
    res_filtered = await handler.handle(GetDocTemplatesQuery(category="Integraciones"))
    assert len(res_filtered.templates) >= 1
    assert all(t["category"].lower() == "integraciones" for t in res_filtered.templates)


# =====================================================================
# Social CQRS Unit Tests
# =====================================================================

class FakeSocialRepository(ISocialRepository):
    def __init__(self) -> None:
        self.comments: dict[str, Comment] = {}

    async def add_comment(self, comment: Comment) -> Comment:
        self.comments[comment.id] = comment
        return comment

    async def get_comments_for_target(self, target_id: str) -> list[Comment]:
        return [c for c in self.comments.values() if c.target_id == target_id or c.book_id == target_id]

    async def delete_comment(self, comment_id: str) -> bool:
        if comment_id in self.comments:
            del self.comments[comment_id]
            return True
        return False

    async def add_rating(self, rating: Rating) -> Rating:
        return rating

    async def get_ratings_for_target(self, target_id: str) -> list[Rating]:
        return []


@pytest.mark.asyncio
async def test_add_comment_handler() -> None:
    repo = FakeSocialRepository()
    handler = AddCommentHandler(repo)
    command = AddCommentCommand(
        target_id="modules/billing/retry_policy.md",
        user_name="John Dev",
        user_email="john@example.com",
        content="Great architecture documentation!",
    )
    res = await handler.handle(command)
    assert res.success is True
    assert res.comment is not None
    assert res.comment["user_name"] == "John Dev"
    assert res.comment["content"] == "Great architecture documentation!"


def test_add_comment_validator() -> None:
    validator = AddCommentValidator()
    with pytest.raises(ValidationException):
        validator.validate(AddCommentCommand(target_id="", user_name="User", user_email="u@e.com", content="Valid"))
    with pytest.raises(ValidationException):
        validator.validate(AddCommentCommand(target_id="doc", user_name="", user_email="u@e.com", content="Valid"))
    with pytest.raises(ValidationException):
        validator.validate(AddCommentCommand(target_id="doc", user_name="User", user_email="u@e.com", content=""))
    with pytest.raises(ValidationException):
        validator.validate(AddCommentCommand(target_id="doc", user_name="User", user_email="u@e.com", content="x" * 2001))


@pytest.mark.asyncio
async def test_moderate_comment_handler() -> None:
    repo = FakeSocialRepository()
    c = Comment(id="comm-1", target_id="doc1", user_name="User", content="To be deleted")
    await repo.add_comment(c)

    handler = ModerateCommentHandler(repo)
    res_del = await handler.handle(ModerateCommentCommand(comment_id="comm-1", action="delete"))
    assert res_del.success is True

    # Deleting missing raises NotFoundException
    with pytest.raises(NotFoundException):
        await handler.handle(ModerateCommentCommand(comment_id="comm-1", action="delete"))

    # Approve action
    res_app = await handler.handle(ModerateCommentCommand(comment_id="comm-2", action="approve"))
    assert res_app.success is True


# =====================================================================
# Chat CQRS Unit Tests
# =====================================================================

class FakeChatSessionRepository(IChatSessionRepository):
    def __init__(self) -> None:
        self.sessions: dict[str, ScopedChatSession] = {}

    async def get_session(self, session_id: str) -> ScopedChatSession | None:
        return self.sessions.get(session_id)

    async def save_session(self, session: ScopedChatSession) -> ScopedChatSession:
        self.sessions[session.session_id] = session
        return session

    async def append_message(self, session_id: str, message: ChatMessage) -> ChatMessage:
        if session_id not in self.sessions:
            self.sessions[session_id] = ScopedChatSession(session_id=session_id, book_id="default_book", library_id="default_lib")
        self.sessions[session_id].messages.append(message)
        return message

    async def list_sessions_for_book(self, book_id: str) -> list[ScopedChatSession]:
        return [s for s in self.sessions.values() if s.book_id == book_id]



@pytest.mark.asyncio
async def test_send_scoped_message_handler() -> None:
    chat_repo = FakeChatSessionRepository()
    mock_service = MagicMock(spec=ScopedChatService)
    mock_service.answer_question = AsyncMock(return_value={
        "answer": "La política aplica 3 reintentos con backoff.",
        "sources": [
            {
                "document_path": "modules/billing/retry_policy.md",
                "location": "Sección 2",
                "excerpt": "Intento 1 tras 2 segundos",
                "is_attachment": False,
            }
        ],
    })

    handler = SendScopedMessageHandler(chat_repo=chat_repo, chat_service=mock_service)
    command = SendScopedMessageCommand(
        session_id="session-xyz",
        library_id="core",
        book_id="retry_policy",
        user_message="¿Cuántos reintentos tiene la política?",
        raw_markdown="# Content",
    )
    res = await handler.handle(command)

    assert res.session_id == "session-xyz"
    assert "3 reintentos" in res.assistant_response
    assert len(res.sources) == 1
    assert res.sources[0]["location"] == "Sección 2"

    saved_session = await chat_repo.get_session("session-xyz")
    assert saved_session is not None
    assert len(saved_session.messages) == 2
    assert saved_session.messages[0].role == "user"
    assert saved_session.messages[1].role == "assistant"


@pytest.mark.asyncio
async def test_get_chat_history_handler() -> None:
    chat_repo = FakeChatSessionRepository()
    session = ScopedChatSession(session_id="sess-1", book_id="doc1", library_id="lib1")
    session.messages.append(ChatMessage(id="m1", role="user", content="Hello"))
    session.messages.append(ChatMessage(id="m2", role="assistant", content="Hi! How can I help?"))
    await chat_repo.save_session(session)

    handler = GetChatHistoryHandler(chat_repo)
    res = await handler.handle(GetChatHistoryQuery(session_id="sess-1"))
    assert res.count == 2
    assert res.messages[0]["content"] == "Hello"
    assert res.messages[1]["content"] == "Hi! How can I help?"

    # Non-existent
    res_empty = await handler.handle(GetChatHistoryQuery(session_id="unknown"))
    assert res_empty.count == 0


@pytest.mark.asyncio
async def test_ask_scoped_document_handler() -> None:
    mock_service = MagicMock(spec=ScopedChatService)
    mock_service.answer_question = AsyncMock(return_value={
        "answer": "Respuesta directa a la consulta.",
        "sources": [{"document_path": "doc.md", "location": "p. 1", "excerpt": "test"}],
    })

    handler = AskScopedDocumentHandler(mock_service)
    query = AskScopedDocumentQuery(
        library_id="lib",
        book_id="doc",
        raw_markdown="# Markdown",
        query="¿Qué es esto?",
    )
    res = await handler.handle(query)
    assert res.answer == "Respuesta directa a la consulta."
    assert len(res.sources) == 1


# =====================================================================
# Application Behaviors and Pipeline Tests
# =====================================================================

@pytest.mark.asyncio
async def test_behaviors_pipeline() -> None:
    # 1. ValidationBehavior
    val_behavior = ValidationBehavior[UpdateBookStatusCommand, Any]()
    cmd_valid = UpdateBookStatusCommand(book_id="book-1", new_status="archived")

    async def next_caller(req: Any) -> str:
        return "ok"

    res = await val_behavior.handle(cmd_valid, next_caller)
    assert res == "ok"

    # 2. LoggingBehavior
    log_behavior = LoggingBehavior[UpdateBookStatusCommand, Any]()
    res_log = await log_behavior.handle(cmd_valid, next_caller)
    assert res_log == "ok"

    # 3. TransactionBehavior
    mock_uow = MagicMock(spec=IUnitOfWork)
    mock_uow.__aenter__ = AsyncMock(return_value=mock_uow)
    mock_uow.__aexit__ = AsyncMock(return_value=None)
    mock_uow.commit = AsyncMock()
    mock_uow.rollback = AsyncMock()

    tx_behavior = TransactionBehavior[UpdateBookStatusCommand, Any](mock_uow)
    res_tx = await tx_behavior.handle(cmd_valid, next_caller)
    assert res_tx == "ok"
    mock_uow.__aenter__.assert_awaited_once()
    mock_uow.commit.assert_awaited_once()



# =====================================================================
# Mappers Tests
# =====================================================================

def test_mappers_roundtrip() -> None:
    # CatalogMapper
    b = Book(id="b1", slug="b1", library_slug="core", module_name="mod", title="Title", path="mod/doc.md")
    b_dto = CatalogMapper.book_to_dto(b)
    assert b_dto["id"] == "b1"
    assert b_dto["title"] == "Title"

    lib = Library(slug="core", name="Core", is_active=True)
    lib_dto = CatalogMapper.library_to_dto(lib)
    assert lib_dto["slug"] == "core"
    assert lib_dto["is_active"] is True

    # SocialMapper
    comm = Comment(id="c1", target_id="target", user_name="User", content="Content")
    c_dto = SocialMapper.comment_to_dto(comm)
    assert c_dto["id"] == "c1"
    assert c_dto["user_name"] == "User"

    # ChatMapper
    ref = DocumentSourceRef(document_path="p", location="l", excerpt="e")
    msg = ChatMessage(id="m1", role="user", content="Hi", sources=[ref])
    m_dto = ChatMapper.message_to_dto(msg)
    assert m_dto["id"] == "m1"
    assert len(m_dto["sources"]) == 1
    assert m_dto["sources"][0]["location"] == "l"
