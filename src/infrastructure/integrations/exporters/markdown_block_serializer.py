"""Bidirectional serializer/deserializer between Dual Editor Blocks and Markdown (0 emojis)."""

from __future__ import annotations

import re
from typing import Any
import yaml


class MarkdownBlockSerializer:
    @staticmethod
    def blocks_to_markdown(
        *,
        title: str,
        module: str,
        library_id: str,
        tags: list[str],
        description: str,
        blocks: list[dict[str, Any]],
    ) -> str:
        fm: dict[str, Any] = {
            "title": title,
            "module": module,
            "library_id": library_id,
            "tags": tags,
            "description": description or "",
        }
        fm_yaml = yaml.safe_dump(fm, sort_keys=False, allow_unicode=True).strip()
        lines: list[str] = ["---", fm_yaml, "---", ""]
        for b in blocks:
            btype = str(b.get("type", "paragraph"))
            if btype == "heading":
                lvl = max(1, min(int(b.get("level", 2)), 6))
                lines.extend([f"{'#' * lvl} {b.get('text', '')}", ""])
            elif btype == "paragraph":
                lines.extend([str(b.get("text", "")), ""])
            elif btype == "code":
                lang = str(b.get("language", "text") or "text")
                lines.extend([f"```{lang}", str(b.get("code", "")), "```", ""])
            elif btype == "mermaid":
                lines.extend(["```mermaid", str(b.get("code", "")), "```", ""])
            elif btype == "attachment":
                caption = str(b.get("caption") or b.get("file_name") or "anexo")
                fpath = str(b.get("file_path", ""))
                if b.get("is_image"):
                    lines.extend([f"![{caption}]({fpath})", ""])
                else:
                    lines.extend([f"> **Anexo:** [{caption}]({fpath})", ""])
        return "\n".join(lines).strip() + "\n"

    @staticmethod
    def markdown_to_blocks(raw_markdown: str) -> tuple[dict[str, Any], list[dict[str, Any]]]:
        metadata: dict[str, Any] = {}
        content = raw_markdown or ""
        if content.startswith("---"):
            parts = content.split("---", 2)
            if len(parts) >= 3:
                try:
                    loaded = yaml.safe_load(parts[1].strip())
                    if isinstance(loaded, dict):
                        metadata = loaded
                except Exception:
                    pass
                content = parts[2].strip()

        blocks: list[dict[str, Any]] = []
        lines = content.splitlines()
        idx, total = 0, len(lines)
        while idx < total:
            stripped = lines[idx].strip()
            if not stripped:
                idx += 1
                continue
            if stripped.startswith("```"):
                lang = stripped[3:].strip().lower()
                code_lines: list[str] = []
                idx += 1
                while idx < total and not lines[idx].strip().startswith("```"):
                    code_lines.append(lines[idx])
                    idx += 1
                if idx < total and lines[idx].strip().startswith("```"):
                    idx += 1
                body = "\n".join(code_lines)
                if lang == "mermaid":
                    blocks.append({"type": "mermaid", "code": body})
                else:
                    blocks.append({"type": "code", "language": lang or "text", "code": body})
                continue
            hm = re.match(r"^(#{1,6})\s+(.*)$", stripped)
            if hm:
                blocks.append({"type": "heading", "level": len(hm.group(1)), "text": hm.group(2).strip()})
                idx += 1
                continue
            im = re.match(r"^!\[(.*?)\]\((.*?)\)$", stripped)
            if im:
                blocks.append({"type": "attachment", "file_name": im.group(1) or im.group(2).split("/")[-1], "file_path": im.group(2), "mime_type": "image/png", "is_image": True})
                idx += 1
                continue
            am = re.match(r"^(?:>\s*)?\*\*Anexo:\*\*\s*\[(.*?)\]\(<?(.*?)>?\)$", stripped)
            if am:
                blocks.append({"type": "attachment", "file_name": am.group(1).strip(), "file_path": am.group(2).strip(), "mime_type": "application/octet-stream", "is_image": False})
                idx += 1
                continue
            para_lines = [stripped]
            idx += 1
            while idx < total:
                nxt = lines[idx].strip()
                if not nxt or nxt.startswith(("#", "```", "![", "> **Anexo:**")):
                    break
                para_lines.append(nxt)
                idx += 1
            blocks.append({"type": "paragraph", "text": "\n".join(para_lines)})
        return metadata, blocks
