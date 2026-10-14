"""Handler for SaveRawMarkdownCommand."""

from __future__ import annotations

from pathlib import Path
from application.book_registry.commands.save_raw_markdown.command import (
    SaveRawMarkdownCommand,
)
from application.book_registry.commands.save_raw_markdown.response import (
    SaveRawMarkdownResponse,
)
from application.book_registry.commands.save_raw_markdown.validator import (
    SaveRawMarkdownValidator,
)


class SaveRawMarkdownHandler:
    """Saves raw Markdown text directly to target sovereign path."""

    def __init__(self, docs_base_path: str = "./docs") -> None:
        self._docs_base_path = Path(docs_base_path)
        self._validator = SaveRawMarkdownValidator()

    async def handle(self, command: SaveRawMarkdownCommand) -> SaveRawMarkdownResponse:
        self._validator.validate(command)
        doc_name = command.doc_name.strip()
        if not doc_name.endswith(".md"):
            doc_name = f"{doc_name}.md"

        target_dir = self._docs_base_path / command.library_id / (command.module or "general")
        target_dir.mkdir(parents=True, exist_ok=True)
        target_path = target_dir / doc_name
        target_path.write_text(command.raw_markdown, encoding="utf-8")

        return SaveRawMarkdownResponse(
            success=True,
            file_path=str(target_path.as_posix()),
            message="Raw Markdown saved successfully.",
        )

