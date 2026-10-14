"""Block Serializer: compiles visual DocumentBlocks to flat Markdown."""

from __future__ import annotations

from typing import Any
import yaml

from domain.book_registry.entities import (
    AttachmentBlock,
    CodeBlock,
    DocumentBlock,
    HeadingBlock,
    MermaidBlock,
    ParagraphBlock,
)


class BlockSerializer:
    """Serializes visual blocks into plain Markdown with YAML Frontmatter."""

    @staticmethod
    def blocks_to_markdown(
        title: str,
        module: str,
        library_id: str,
        tags: list[str],
        description: str,
        blocks: list[DocumentBlock],
    ) -> str:
        """Compile visual blocks to standard Markdown with YAML Frontmatter."""
        frontmatter: dict[str, Any] = {
            "title": title,
            "module": module,
            "library_id": library_id,
            "tags": tags,
            "description": description or "",
        }

        fm_yaml = yaml.dump(frontmatter, sort_keys=False, allow_unicode=True).strip()
        lines: list[str] = ["---", fm_yaml, "---", ""]

        for b in blocks:
            if isinstance(b, HeadingBlock):
                prefix = "#" * max(1, min(b.level, 6))
                lines.extend([f"{prefix} {b.text}", ""])
            elif isinstance(b, ParagraphBlock):
                lines.extend([b.text, ""])
            elif isinstance(b, CodeBlock):
                lines.extend([f"```{b.language}", b.code, "```", ""])
            elif isinstance(b, MermaidBlock):
                lines.extend(["```mermaid", b.code, "```", ""])
            elif isinstance(b, AttachmentBlock):
                caption = b.caption or b.file_name
                if b.is_image:
                    lines.extend([f"![{caption}]({b.file_path})", ""])
                else:
                    lines.extend([f"> 📎 **Anexo:** [{caption}]({b.file_path})", ""])

        return "\n".join(lines).strip() + "\n"
