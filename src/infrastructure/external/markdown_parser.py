"""External Markdown Parser and Bidirectional Block Serializer Service."""

from __future__ import annotations

import re
from typing import Any
import marko
import yaml

from domain.book_registry.entities import (
    AttachmentBlock,
    CodeBlock,
    DocumentBlock,
    HeadingBlock,
    MermaidBlock,
    ParagraphBlock,
)
from domain.knowledge_docs.entities import RenderedMarkdown


class MarkdownParser:
    """Bidirectional serializer/deserializer: Blocks <---> Markdown with YAML Frontmatter."""

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

    @staticmethod
    def markdown_to_blocks(raw_markdown: str) -> tuple[dict[str, Any], list[DocumentBlock]]:
        """Decompile raw Markdown into structured metadata dict and DocumentBlock list."""
        metadata: dict[str, Any] = {}
        content = raw_markdown

        # 1. Parse YAML Frontmatter if present
        if content.startswith("---"):
            parts = content.split("---", 2)
            if len(parts) >= 3:
                fm_text = parts[1].strip()
                try:
                    loaded = yaml.safe_load(fm_text)
                    if isinstance(loaded, dict):
                        metadata = loaded
                except Exception:
                    pass
                content = parts[2].strip()

        # 2. Parse Markdown body into blocks
        blocks: list[DocumentBlock] = []
        lines = content.split("\n")
        idx = 0
        total_lines = len(lines)

        while idx < total_lines:
            line = lines[idx]
            stripped = line.strip()

            if not stripped:
                idx += 1
                continue

            # Code / Mermaid block
            if stripped.startswith("```"):
                lang = stripped[3:].strip().lower()
                code_lines: list[str] = []
                idx += 1
                while idx < total_lines and not lines[idx].strip().startswith("```"):
                    code_lines.append(lines[idx])
                    idx += 1
                if idx < total_lines and lines[idx].strip().startswith("```"):
                    idx += 1  # Skip closing fence

                code_body = "\n".join(code_lines)
                if lang == "mermaid":
                    blocks.append(MermaidBlock(code=code_body))
                else:
                    blocks.append(CodeBlock(language=lang or "text", code=code_body))
                continue

            # Heading block (# Heading)
            heading_match = re.match(r"^(#{1,6})\s+(.*)$", stripped)
            if heading_match:
                level = len(heading_match.group(1))
                text = heading_match.group(2).strip()
                blocks.append(HeadingBlock(level=level, text=text))
                idx += 1
                continue

            # Image attachment: ![alt](path)
            img_match = re.match(r"^!\[(.*?)\]\((.*?)\)$", stripped)
            if img_match:
                caption = img_match.group(1)
                file_path = img_match.group(2)
                blocks.append(
                    AttachmentBlock(
                        file_name=caption or file_path.split("/")[-1],
                        file_path=file_path,
                        mime_type="image/png",
                        is_image=True,
                        caption=caption,
                    )
                )
                idx += 1
                continue

            # File attachment: > 📎 **Anexo:** [name](path)
            att_match = re.match(r"^>\s*📎\s*\*\*Anexo:\*\*\s*\[(.*?)\]\((.*?)\)$", stripped)
            if att_match:
                name = att_match.group(1)
                file_path = att_match.group(2)
                blocks.append(
                    AttachmentBlock(
                        file_name=name,
                        file_path=file_path,
                        mime_type="application/octet-stream",
                        is_image=False,
                        caption=name,
                    )
                )
                idx += 1
                continue

            # Regular paragraph lines: collect consecutive non-empty lines
            paragraph_lines: list[str] = [stripped]
            idx += 1
            while idx < total_lines:
                next_line = lines[idx].strip()
                if not next_line:
                    break
                if next_line.startswith("#") or next_line.startswith("```") or next_line.startswith("![") or next_line.startswith("> 📎"):
                    break
                paragraph_lines.append(next_line)
                idx += 1

            blocks.append(ParagraphBlock(text="\n".join(paragraph_lines)))

        return metadata, blocks


class MarkdownParserService:
    """Parses markdown text into HTML and calculates reading metrics."""

    def __init__(self) -> None:
        self._parser = marko.Markdown()

    def render(self, raw_markdown: str) -> RenderedMarkdown:
        cleaned = raw_markdown.strip()
        if not cleaned:
            return RenderedMarkdown(
                html_content="<p class='text-gray-400 italic'>Sin contenido para previsualizar.</p>",
                raw_markdown="",
                word_count=0,
                reading_time_minutes=0,
            )

        # Convert using marko
        html = str(self._parser.convert(cleaned))

        # Calculate word count (strip markdown symbols for rough count)
        words = len(re.findall(r"\b\w+\b", cleaned))
        reading_time = max(1, round(words / 200)) if words > 0 else 0

        return RenderedMarkdown(
            html_content=html,
            raw_markdown=cleaned,
            word_count=words,
            reading_time_minutes=reading_time,
        )
