"""Book Registry and Dual Block Editor Domain Entities."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Union


class BlockType(str, Enum):
    """Supported visual block types for dual editing."""

    HEADING = "heading"
    PARAGRAPH = "paragraph"
    CODE = "code"
    MERMAID = "mermaid"
    ATTACHMENT = "attachment"


@dataclass
class HeadingBlock:
    """Heading block compiling to Markdown '#...#'."""

    level: int  # 1 to 6
    text: str
    type: BlockType = BlockType.HEADING

    def to_dict(self) -> dict[str, Any]:
        return {"type": self.type.value, "level": self.level, "text": self.text}


@dataclass
class ParagraphBlock:
    """Rich text paragraph block."""

    text: str
    type: BlockType = BlockType.PARAGRAPH

    def to_dict(self) -> dict[str, Any]:
        return {"type": self.type.value, "text": self.text}


@dataclass
class CodeBlock:
    """Code snippet block with language syntax specification."""

    language: str
    code: str
    type: BlockType = BlockType.CODE

    def to_dict(self) -> dict[str, Any]:
        return {"type": self.type.value, "language": self.language, "code": self.code}


@dataclass
class MermaidBlock:
    """Mermaid diagram definition block."""

    code: str
    type: BlockType = BlockType.MERMAID

    def to_dict(self) -> dict[str, Any]:
        return {"type": self.type.value, "code": self.code}


@dataclass
class AttachmentBlock:
    """Attachment reference block (document, image, spreadsheet)."""

    file_name: str
    file_path: str
    mime_type: str
    is_image: bool = False
    caption: str | None = None
    type: BlockType = BlockType.ATTACHMENT

    def to_dict(self) -> dict[str, Any]:
        return {
            "type": self.type.value,
            "file_name": self.file_name,
            "file_path": self.file_path,
            "mime_type": self.mime_type,
            "is_image": self.is_image,
            "caption": self.caption,
        }


DocumentBlock = Union[HeadingBlock, ParagraphBlock, CodeBlock, MermaidBlock, AttachmentBlock]


@dataclass
class Attachment:
    """Sovereign Attachment Entity stored locally in disk."""

    id: str
    book_id: str
    file_name: str
    file_path: str
    mime_type: str
    size_bytes: int
    uploaded_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "book_id": self.book_id,
            "file_name": self.file_name,
            "file_path": self.file_path,
            "mime_type": self.mime_type,
            "size_bytes": self.size_bytes,
            "uploaded_at": self.uploaded_at.isoformat(),
        }


@dataclass
class DraftBook:
    """Draft Book or Document being constructed in Dual Editor."""

    id: str
    library_id: str
    module: str
    title: str
    description: str
    tags: list[str]
    raw_markdown: str
    attachments: list[Attachment] = field(default_factory=list)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

