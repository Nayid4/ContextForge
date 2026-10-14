"""Handler for CreateBookFromBlocksCommand."""

from __future__ import annotations

from pathlib import Path
import re
from typing import Any
from application.book_registry.commands.create_book_from_blocks.command import (
    CreateBookFromBlocksCommand,
)
from application.book_registry.commands.create_book_from_blocks.response import (
    CreateBookFromBlocksResponse,
)
from application.book_registry.commands.create_book_from_blocks.validator import (
    CreateBookFromBlocksValidator,
)
from domain.book_registry.entities import (
    AttachmentBlock,
    CodeBlock,
    DocumentBlock,
    HeadingBlock,
    MermaidBlock,
    ParagraphBlock,
)
from infrastructure.external.markdown_parser import MarkdownParser


class CreateBookFromBlocksHandler:
    """Compiles visual blocks into standard Markdown and writes to sovereign disk."""

    def __init__(self, docs_base_path: str = "./docs") -> None:
        self._docs_base_path = Path(docs_base_path)
        self._validator = CreateBookFromBlocksValidator()

    def _convert_blocks(self, raw_blocks: list[dict[str, Any]]) -> list[DocumentBlock]:
        converted: list[DocumentBlock] = []
        for b in raw_blocks:
            b_type = str(b.get("type", "")).lower()
            if b_type == "heading":
                converted.append(
                    HeadingBlock(
                        level=int(b.get("level", 1)),
                        text=str(b.get("text", "")),
                    )
                )
            elif b_type == "paragraph":
                converted.append(ParagraphBlock(text=str(b.get("text", ""))))
            elif b_type == "code":
                converted.append(
                    CodeBlock(
                        language=str(b.get("language", "text")),
                        code=str(b.get("code", "")),
                    )
                )
            elif b_type == "mermaid":
                converted.append(MermaidBlock(code=str(b.get("code", ""))))
            elif b_type == "attachment":
                converted.append(
                    AttachmentBlock(
                        file_name=str(b.get("file_name", "")),
                        file_path=str(b.get("file_path", "")),
                        mime_type=str(b.get("mime_type", "application/octet-stream")),
                        is_image=bool(b.get("is_image", False)),
                        caption=b.get("caption"),
                    )
                )
        return converted

    async def handle(self, command: CreateBookFromBlocksCommand) -> CreateBookFromBlocksResponse:
        self._validator.validate(command)
        blocks = self._convert_blocks(command.blocks)
        compiled_markdown = MarkdownParser.blocks_to_markdown(
            title=command.title,
            module=command.module or "general",
            library_id=command.library_id,
            tags=command.tags,
            description=command.description,
            blocks=blocks,
        )

        doc_name = command.doc_name.strip()
        if not doc_name:
            doc_name = re.sub(r"[^\w\s-]", "", command.title).strip().lower()
            doc_name = re.sub(r"[-\s]+", "-", doc_name)
        if not doc_name.endswith(".md"):
            doc_name = f"{doc_name}.md"

        target_dir = self._docs_base_path / command.library_id / (command.module or "general")
        target_dir.mkdir(parents=True, exist_ok=True)
        target_path = target_dir / doc_name
        target_path.write_text(compiled_markdown, encoding="utf-8")

        return CreateBookFromBlocksResponse(
            success=True,
            file_path=str(target_path.as_posix()),
            raw_markdown=compiled_markdown,
            message="Book successfully compiled and saved to sovereign storage.",
        )

