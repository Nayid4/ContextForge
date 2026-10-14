"""Book Registry CQRS application module."""

from application.book_registry.commands.create_book_from_blocks import (
    CreateBookFromBlocksCommand,
    CreateBookFromBlocksHandler,
    CreateBookFromBlocksResponse,
    CreateBookFromBlocksValidator,
)
from application.book_registry.commands.save_raw_markdown import (
    SaveRawMarkdownCommand,
    SaveRawMarkdownHandler,
    SaveRawMarkdownResponse,
    SaveRawMarkdownValidator,
)
from application.book_registry.commands.upload_attachment import (
    UploadAttachmentCommand,
    UploadAttachmentHandler,
    UploadAttachmentResponse,
    UploadAttachmentValidator,
)
from application.book_registry.queries.get_book_draft import (
    GetBookDraftHandler,
    GetBookDraftQuery,
    GetBookDraftResponse,
    GetBookDraftValidator,
)
from application.book_registry.queries.get_doc_templates import (
    GetDocTemplatesHandler,
    GetDocTemplatesQuery,
    GetDocTemplatesResponse,
    GetDocTemplatesValidator,
)

__all__ = [
    "CreateBookFromBlocksCommand",
    "CreateBookFromBlocksResponse",
    "CreateBookFromBlocksValidator",
    "CreateBookFromBlocksHandler",
    "SaveRawMarkdownCommand",
    "SaveRawMarkdownResponse",
    "SaveRawMarkdownValidator",
    "SaveRawMarkdownHandler",
    "UploadAttachmentCommand",
    "UploadAttachmentResponse",
    "UploadAttachmentValidator",
    "UploadAttachmentHandler",
    "GetBookDraftQuery",
    "GetBookDraftResponse",
    "GetBookDraftValidator",
    "GetBookDraftHandler",
    "GetDocTemplatesQuery",
    "GetDocTemplatesResponse",
    "GetDocTemplatesValidator",
    "GetDocTemplatesHandler",
]

